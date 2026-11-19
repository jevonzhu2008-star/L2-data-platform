/* 内网 IIS / 桌面版 / 本地调试的账号表单
 * 公网 Pages 默认隐藏该表单，只保留 Microsoft SSO。
 */
(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  if (!form) return;

  var isApi = !!(window.L2Auth && L2Auth.mode === "api");
  var isLocalShell = isApi || location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (!isLocalShell) {
    form.hidden = true;
    return;
  }

  form.hidden = false;
  var divider = document.getElementById("localDivider");
  var localNote = document.getElementById("localNote");
  var demoBox = document.getElementById("demoBox");
  if (divider) divider.hidden = false;
  if (localNote) localNote.hidden = false;
  if (demoBox) demoBox.hidden = true;

  var username = document.getElementById("username");
  var password = document.getElementById("password");
  var remember = document.getElementById("remember");
  var error = document.getElementById("error");
  var submitBtn = document.getElementById("submitBtn");
  var toggle = document.getElementById("togglePwd");
  var modeTip = document.getElementById("modeTip");

  function nextUrl() {
    var next = new URLSearchParams(location.search).get("next") || "index.html";
    if (!/^[A-Za-z0-9._\/#?=&%-]+$/.test(next) || next.indexOf("//") >= 0 ||
        next.indexOf("..") >= 0 || next.indexOf(":") >= 0) {
      next = "index.html";
    }
    return next;
  }
  function showError(msg) { error.textContent = msg; error.hidden = false; }
  function clearError() { error.hidden = true; }
  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "登录中…" : "登 录";
  }

  if (window.L2Auth && L2Auth.isAuthed()) { location.replace(nextUrl()); return; }

  if (isApi) {
    modeTip.textContent = "账号由平台管理员在后台创建；忘记密码请联系管理员重置。";
    if (L2Auth.health) {
      L2Auth.health().then(function (info) {
        if (!info && L2Auth.serverOnly) {
          modeTip.textContent = "当前无法连接账号服务，请确认访问地址正确或稍后重试；如持续失败请联系管理员。";
          submitBtn.disabled = true;
          submitBtn.textContent = "服务暂不可用";
        }
      });
    }
  } else if (window.L2Auth && L2Auth.serverOnly) {
    modeTip.textContent = "当前无法连接账号服务，请确认内网地址或稍后重试。";
    submitBtn.disabled = true;
    submitBtn.textContent = "服务暂不可用";
  } else {
    modeTip.textContent = "账号由管理员分配：如需开通账号或重置密码，请联系平台管理员。";
  }

  toggle.addEventListener("click", function () {
    var show = password.type === "password";
    password.type = show ? "text" : "password";
    toggle.textContent = show ? "隐藏" : "显示";
    toggle.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    var u = username.value.trim();
    var p = password.value;
    if (!u || !p) { showError("请输入账号和密码"); return; }
    setBusy(true);

    if (isApi) {
      L2Auth.login(u, p, remember.checked).then(function () {
        location.replace(nextUrl());
      }).catch(function (err) {
        showError(friendly(err, "账号或密码不正确"));
        setBusy(false);
        password.value = "";
        password.focus();
      });
      return;
    }

    var fresh = L2Auth.reloadConfig ? L2Auth.reloadConfig() : Promise.resolve();
    fresh.then(function () { return L2Auth.verify(u, p); }).then(function (user) {
      if (!user) {
        showError("账号或密码不正确");
        setBusy(false);
        password.value = "";
        password.focus();
        return;
      }
      L2Auth.saveToken(user, remember.checked, null,
        L2Auth.roleOf ? L2Auth.roleOf(user) : "user",
        L2Auth.displayNameOf ? L2Auth.displayNameOf(user) : user);
      location.replace(nextUrl());
    }).catch(function () {
      showError("登录失败，请刷新页面后重试");
      setBusy(false);
    });
  });

  function friendly(err, fallback) {
    if (!err) return fallback;
    if (err.code === "invalid_credentials") return "账号或密码不正确";
    if (err.code === "account_locked") return err.retryAfter ? ("登录失败次数过多，请 " + Math.ceil(err.retryAfter / 60) + " 分钟后再试") : "登录失败次数过多，请稍后再试";
    if (err.code === "account_disabled") return "账号已被禁用，请联系管理员";
    if (err.code === "rate_limited") return "操作过于频繁，请稍后再试";
    if (err.message) return err.message;
    return fallback;
  }

  [username, password].forEach(function (el) {
    el.addEventListener("input", clearError);
  });
})();
