/* 登录校验与令牌
 * - mode = "api"   ：内网 IIS 版本，走 /api/* 账号服务（自助注册、改密、后台管理）
 * - mode = "local" ：GitHub Pages / 桌面版，沿用纯前端 PBKDF2 门禁
 * 静态模式不发起任何网络请求，避免在 file:// 与控制台产生错误。
 */
(function () {
  "use strict";

  var KEY = "l2_auth_token";
  var CFG = window.L2_AUTH || { accounts: [], iterations: 120000 };
  var MODE = CFG.mode === "api" ? "api" : "local";
  var SERVER_ONLY = CFG.serverOnly === true;

  /* ------------------------------ 本地派生 ------------------------------ */

  function b64ToBytes(b64) {
    var raw = atob(b64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function bytesToB64(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  function derive(password, saltB64, iterations) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"])
      .then(function (key) {
        return crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: b64ToBytes(saltB64), iterations: iterations, hash: "SHA-256" },
          key,
          256
        );
      })
      .then(function (bits) { return bytesToB64(new Uint8Array(bits)); });
  }

  function find(username) {
    var u = String(username || "").trim().toLowerCase();
    var cfg = window.L2_AUTH || CFG;
    var list = cfg.accounts || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].username).toLowerCase() === u) return list[i];
    }
    return null;
  }

  function verifyLocal(username, password) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve(null);
    if (SERVER_ONLY) return Promise.resolve(null); // 服务端部署时禁用本地回退
    var cfg = window.L2_AUTH || CFG;
    var acct = find(username);
    var iterations = acct ? (acct.iterations || cfg.iterations) : cfg.iterations;
    // 账号不存在时也计算一次，避免明显的存在性时序差异
    var salt = acct ? acct.salt : "AAAAAAAAAAAAAAAAAAAAAA==";
    return derive(password, salt, iterations).then(function (hash) {
      return acct && hash === acct.hash ? acct.username : null;
    });
  }

  /* ------------------------------ 令牌存储 ------------------------------ */

  function read() {
    var stores = [sessionStorage, localStorage];
    for (var i = 0; i < stores.length; i++) {
      try {
        var raw = stores[i].getItem(KEY);
        if (!raw) continue;
        var t = JSON.parse(raw);
        if (t && t.exp > Date.now()) return t;
        stores[i].removeItem(KEY);
      } catch (e) { /* ignore */ }
    }
    return null;
  }

  function saveToken(username, remember, serverToken, role, displayName) {
    var ttl = remember ? 7 * 24 * 3600 * 1000 : 12 * 3600 * 1000;
    var token = {
      u: username,
      exp: Date.now() + ttl,
      remember: !!remember
    };
    if (serverToken) token.token = serverToken;
    if (role) token.role = role;
    if (displayName) token.dn = displayName;
    try {
      clearStorage();
      (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(token));
    } catch (e) { /* ignore */ }
  }

  function clearStorage() {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  function isAuthed() { return !!read(); }
  function currentUser() { var t = read(); return t ? t.u : ""; }
  function currentDisplayName() { var t = read(); return t && t.dn ? t.dn : currentUser(); }
  function currentRole() { var t = read(); return t && t.role ? t.role : "user"; }
  function getToken() { var t = read(); return t && t.token ? t.token : ""; }
  function isAdmin() { return currentRole() === "admin"; }

  /// 本地账号表里可能带 displayName（自助注册时保留），取不到就回落为账号名
  function displayNameOf(username) {
    var acct = find(username);
    return acct && acct.displayName ? acct.displayName : (username || "");
  }

  /* ------------------------------ 服务端 API ------------------------------ */

  function apiError(status, body) {
    var err = { status: status, code: "http_" + status, message: "请求失败（" + status + "）" };
    if (body && body.error) {
      err.code = body.error.code || err.code;
      err.message = body.error.message || err.message;
      if (body.error.retryAfter) err.retryAfter = body.error.retryAfter;
    }
    return err;
  }

  function api(path, method, payload) {
    var options = {
      method: method || "GET",
      cache: "no-store",
      credentials: "omit",
      headers: { "Accept": "application/json" }
    };
    if (payload !== undefined && payload !== null) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    }
    var token = getToken();
    if (token) options.headers["Authorization"] = "Bearer " + token;

    return fetch(path, options).then(function (response) {
      return response.text().then(function (text) {
        var body = null;
        try { body = text ? JSON.parse(text) : null; } catch (e) { body = null; }
        if (!response.ok || !body || body.ok !== true) throw apiError(response.status, body);
        return body;
      });
    });
  }

  function login(username, password, remember) {
    if (MODE !== "api") return Promise.reject({ code: "local_mode", message: "当前版本使用离线账号" });
    return api("api/login", "POST", { username: username, password: password, remember: !!remember })
      .then(function (data) {
        saveToken(data.username, remember, data.token, data.role, data.displayName);
        return data;
      });
  }

  function register(username, password, displayName) {
    if (MODE !== "api") return Promise.reject({ code: "local_mode", message: "当前版本不开放注册" });
    return api("api/register", "POST", {
      username: username,
      password: password,
      displayName: displayName || ""
    }).then(function (data) {
      saveToken(data.username, false, data.token, data.role, data.displayName);
      return data;
    });
  }

  function session() {
    if (MODE !== "api") return Promise.resolve(null);
    if (!getToken()) return Promise.resolve(null);
    return api("api/session", "GET").then(function (data) {
      return {
        username: data.username,
        displayName: data.displayName,
        role: data.role,
        lastLoginAt: data.lastLoginAt,
        mustChangePassword: !!data.mustChangePassword
      };
    }).catch(function (err) {
      if (err && err.status === 401) clearStorage();
      throw err;
    });
  }

  function changePassword(oldPassword, newPassword) {
    if (MODE !== "api") return Promise.reject({ code: "local_mode", message: "当前版本不支持在线改密" });
    return api("api/password", "POST", { oldPassword: oldPassword, newPassword: newPassword });
  }

  function logout() {
    var token = getToken();
    // 本地必然清理；服务端尽力注销，不阻塞跳转
    clearStorage();
    if (MODE === "api" && token) {
      try {
        fetch("api/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "omit",
          keepalive: true,
          headers: { "Authorization": "Bearer " + token }
        }).catch(function () { /* ignore */ });
      } catch (e) { /* ignore */ }
    }
  }

  function health() {
    if (MODE !== "api") return Promise.resolve(null);
    return api("api/health", "GET").catch(function () { return null; });
  }

  /* ------------------------------ 离线版注册（申请码） ------------------------------ */

  /// 在浏览器本地生成 salt + PBKDF2 哈希，只有哈希进入注册码，密码明文不出本机
  function makeRegistration(username, password, displayName) {
    if (!window.crypto || !crypto.subtle || !window.crypto.getRandomValues) {
      return Promise.reject({ code: "no_crypto", message: "当前浏览器不支持密码加密，请换用较新的浏览器" });
    }
    var cfg = window.L2_AUTH || CFG;
    var iterations = cfg.iterations || 120000;
    var saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    var saltB64 = bytesToB64(saltBytes);
    var name = String(username || "").trim();
    var display = String(displayName || "").trim() || name;
    return derive(password, saltB64, iterations).then(function (hash) {
      return {
        l2register: 1,
        username: name,
        displayName: display,
        iterations: iterations,
        salt: saltB64,
        hash: hash
      };
    });
  }

  /// 注册码：L2R1.<base64url(JSON)>，管理员用 python tools/set_password.py --import 合入后发布
  function registrationCode(payload) {
    if (!payload) return "";
    var bytes = new TextEncoder().encode(JSON.stringify(payload));
    var raw = "";
    for (var i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
    return "L2R1." + btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /// 重新拉取 auth.config.js（绕过缓存），用于检测注册是否已生效
  function reloadConfig() {
    return new Promise(function (resolve) {
      var el = document.createElement("script");
      el.src = "assets/auth.config.js?v=" + Date.now();
      el.onload = function () { resolve(window.L2_AUTH || null); };
      el.onerror = function () { resolve(null); };
      document.head.appendChild(el);
    });
  }

  function accountExists(username) {
    if (!username) return Promise.resolve(false);
    return reloadConfig().then(function () { return !!find(username); });
  }

  window.L2Auth = {
    mode: MODE,
    serverOnly: SERVER_ONLY,
    storageKey: KEY,
    // 本地回退
    verify: verifyLocal,
    // 服务端
    login: login,
    register: register,
    session: session,
    changePassword: changePassword,
    health: health,
    api: api,
    // 离线版注册
    makeRegistration: makeRegistration,
    registrationCode: registrationCode,
    reloadConfig: reloadConfig,
    accountExists: accountExists,
    // 缓存
    isAuthed: isAuthed,
    currentUser: currentUser,
    currentDisplayName: currentDisplayName,
    currentRole: currentRole,
    displayNameOf: displayNameOf,
    isAdmin: isAdmin,
    getToken: getToken,
    saveToken: saveToken,
    logout: logout
  };
})();
