/* Microsoft Entra ID 单点登录（MSAL SPA + PKCE）
 * 登录成功后写入平台已有的 l2_auth_token，后续 auth-guard 与 Power BI autoAuth 共用同一浏览器会话。
 */
(function () {
  "use strict";

  var cfg = window.L2_SSO || {};
  var btn = document.getElementById("ssoBtn");
  var note = document.getElementById("ssoNote");
  var error = document.getElementById("error");

  function showError(msg) {
    if (!error) return;
    error.textContent = msg;
    error.hidden = false;
  }

  function nextUrl() {
    var next = new URLSearchParams(location.search).get("next") || "index.html";
    if (!/^[A-Za-z0-9._\/#?=&%-]+$/.test(next) || next.indexOf("//") >= 0 ||
        next.indexOf("..") >= 0 || next.indexOf(":") >= 0) {
      next = "index.html";
    }
    return next;
  }

  function finish(account) {
    var name = (account && (account.name || account.username)) || "Microsoft 账号";
    var user = (account && account.username) || name;
    if (window.L2Auth && L2Auth.saveToken) {
      L2Auth.saveToken(user, true, null, "user", name);
    }
    location.replace(nextUrl());
  }

  if (!btn) return;

  if (!window.msal || !cfg.clientId) {
    btn.disabled = true;
    btn.textContent = "Microsoft 登录待配置";
    if (note) {
      note.textContent = "SSO 尚未启用：缺少 Azure AD 应用注册的 clientId。当前可使用下方演示账号登录。";
      note.classList.add("warn");
    }
    return;
  }

  var app = new msal.PublicClientApplication({
    auth: {
      clientId: cfg.clientId,
      authority: cfg.authority,
      redirectUri: cfg.redirectUri,
      postLogoutRedirectUri: cfg.postLogoutRedirectUri,
      navigateToLoginRequestUrl: false
    },
    cache: { cacheLocation: "localStorage" }
  });

  if (note) note.textContent = "使用 xsyzz 租户的 Microsoft 账号登录；登录后嵌入报表会复用同一会话。";

  app.handleRedirectPromise().then(function (resp) {
    if (resp && resp.account) finish(resp.account);
  }).catch(function (err) {
    showError("Microsoft 登录失败：" + (err && err.message ? err.message : "请重试"));
  });

  btn.addEventListener("click", function () {
    btn.disabled = true;
    btn.textContent = "正在跳转 Microsoft…";
    app.loginRedirect({ scopes: cfg.scopes, prompt: "select_account" }).catch(function (err) {
      btn.disabled = false;
      btn.textContent = "使用 Microsoft 账号登录";
      showError("无法打开 Microsoft 登录：" + (err && err.message ? err.message : "请重试"));
    });
  });
})();
