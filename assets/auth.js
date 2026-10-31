/* 登录校验与本地令牌（纯前端门禁，不构成服务端认证） */
(function () {
  "use strict";
  var KEY = "l2_auth_token";
  var CFG = window.L2_AUTH || { accounts: [], iterations: 120000 };

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
    var list = CFG.accounts || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].username).toLowerCase() === u) return list[i];
    }
    return null;
  }

  function verify(username, password) {
    var acct = find(username);
    var iterations = acct ? (acct.iterations || CFG.iterations) : CFG.iterations;
    // 账号不存在时也计算一次，避免明显的存在性时序差异
    var salt = acct ? acct.salt : "AAAAAAAAAAAAAAAAAAAAAA==";
    return derive(password, salt, iterations).then(function (hash) {
      return acct && hash === acct.hash ? acct.username : null;
    });
  }

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

  function isAuthed() { return !!read(); }
  function currentUser() { var t = read(); return t ? t.u : ""; }

  function saveToken(username, remember) {
    var ttl = remember ? 7 * 24 * 3600 * 1000 : 12 * 3600 * 1000;
    var token = { u: username, exp: Date.now() + ttl, remember: !!remember };
    try {
      logout();
      (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(token));
    } catch (e) { /* ignore */ }
  }

  function logout() {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  window.L2Auth = {
    verify: verify,
    isAuthed: isAuthed,
    currentUser: currentUser,
    saveToken: saveToken,
    logout: logout,
    storageKey: KEY
  };
})();
