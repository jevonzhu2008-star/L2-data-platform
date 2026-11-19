/* Power BI AAD 令牌嵌入
 * 登录页通过 MSAL 取得 Power BI API 的 access token 后，报表页用 Power BI JS SDK
 * 以 TokenType.Aad 嵌入，避免 iframe autoAuth 的二次登录。
 * 没有 SSO 令牌时回退到原有 iframe（内网 IIS / 桌面版 / 本地演示账号）。
 */
(function () {
  "use strict";

  var cfg = window.L2_SSO || {};
  var TOKEN_KEY = "l2_pbi_token";
  var pca = null;
  var current = null;

  if ((window.L2Auth && L2Auth.mode === "api") || location.protocol === "file:") return;
  if (!cfg.clientId) return;

  function parseSrc(src) {
    try {
      var u = new URL(src, location.href);
      return {
        reportId: u.searchParams.get("reportId") || "",
        groupId: u.searchParams.get("groupId") || "",
        pageName: u.searchParams.get("pageName") || ""
      };
    } catch (e) {
      return null;
    }
  }

  function readToken() {
    try {
      var t = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
      if (t && t.token && t.exp > Date.now() + 60000) return t.token;
    } catch (e) { /* ignore */ }
    return "";
  }

  function storeToken(res) {
    if (!res || !res.accessToken) return "";
    try {
      var exp = res.expiresOn ? new Date(res.expiresOn).getTime() : Date.now() + 3300000;
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token: res.accessToken, exp: exp }));
    } catch (e) { /* ignore */ }
    return res.accessToken || "";
  }

  function getPca() {
    if (pca) return pca;
    if (!window.msal) return null;
    pca = new msal.PublicClientApplication({
      auth: {
        clientId: cfg.clientId,
        authority: cfg.authority,
        redirectUri: cfg.redirectUri,
        postLogoutRedirectUri: cfg.postLogoutRedirectUri,
        navigateToLoginRequestUrl: false
      },
      cache: { cacheLocation: "localStorage" }
    });
    return pca;
  }

  function getToken() {
    var cached = readToken();
    if (cached) return Promise.resolve(cached);
    var app = getPca();
    if (!app) return Promise.resolve("");
    var accounts = app.getAllAccounts();
    if (!accounts.length) return Promise.resolve("");
    return app.acquireTokenSilent({ scopes: cfg.scopes, account: accounts[0] })
      .then(function (res) { return storeToken(res); })
      .catch(function () { return ""; });
  }

  function fallback(frame) {
    frame.style.display = "";
    var src = frame.getAttribute("data-src") || "";
    if (src && frame.getAttribute("src") !== src) frame.setAttribute("src", src);
  }

  function embed(frame) {
    if (frame.__l2Embedded) return;
    frame.__l2Embedded = true;
    var src = frame.getAttribute("data-src") || "";
    var info = parseSrc(src);
    if (!info || !info.reportId || !window.powerbi || !window.powerbi.embed) {
      fallback(frame);
      return;
    }

    var view = frame.closest(".report-view") || frame.parentElement;
    var old = view.querySelector("#pbiEmbed");
    if (old) old.remove();

    // 先停掉隐藏 iframe 的 autoAuth 请求，避免后台弹登录
    frame.setAttribute("src", "about:blank");
    frame.style.display = "none";

    var box = document.createElement("div");
    box.id = "pbiEmbed";
    box.className = "service-frame";
    box.style.position = "absolute";
    box.style.inset = "0";
    box.style.background = "#fff";
    view.appendChild(box);

    var loading = document.getElementById("reportLoading");
    var timeoutBox = document.getElementById("reportTimeout");
    if (loading) loading.hidden = true;
    if (timeoutBox) timeoutBox.hidden = true;

    getToken().then(function (token) {
      if (!token) {
        box.remove();
        fallback(frame);
        return;
      }
      var models = window.powerbi.models;
      var embedUrl = "https://app.powerbi.com/reportEmbed?reportId=" + encodeURIComponent(info.reportId) +
        (info.groupId ? "&groupId=" + encodeURIComponent(info.groupId) : "");
      var config = {
        type: "report",
        id: info.reportId,
        embedUrl: embedUrl,
        accessToken: token,
        tokenType: models.TokenType.Aad,
        settings: {
          background: models.BackgroundType.Default,
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: false },
            visualizations: { visible: false }
          }
        }
      };
      if (info.pageName) config.pageName = info.pageName;

      var report = window.powerbi.embed(box, config);
      current = report;

      report.on("loaded", function () {
        if (loading) loading.hidden = true;
        if (timeoutBox) timeoutBox.hidden = true;
        try { frame.dispatchEvent(new Event("load")); } catch (e) { /* ignore */ }
      });
      report.on("error", function () {
        // 令牌/权限异常时退回 iframe，让用户仍能看到 Power BI 的提示
        try { report.remove(); } catch (e) { /* ignore */ }
        if (box.parentNode) box.remove();
        fallback(frame);
      });

      var seg = document.getElementById("kindSeg");
      if (seg) {
        seg.addEventListener("click", function () {
          setTimeout(function () {
            frame.setAttribute("src", "about:blank");
            var next = parseSrc(frame.getAttribute("data-src") || "");
            if (next && next.pageName) report.setPage(next.pageName);
          }, 60);
        });
      }

      // 令牌约 1 小时有效；每 45 分钟静默续期并推给报表
      setInterval(function () {
        var app = getPca();
        var accounts = app ? app.getAllAccounts() : [];
        if (!app || !accounts.length) return;
        app.acquireTokenSilent({ scopes: cfg.scopes, account: accounts[0] }).then(function (res) {
          var fresh = storeToken(res);
          if (fresh && report.setAccessToken) report.setAccessToken(fresh);
        }).catch(function () { /* ignore */ });
      }, 45 * 60 * 1000);
    });
  }

  function scan() {
    var frame = document.getElementById("serviceFrame");
    if (frame) embed(frame);
  }

  var obs = new MutationObserver(function () { scan(); });
  obs.observe(document.body, { childList: true, subtree: true });
  if (document.readyState !== "loading") scan();
  else document.addEventListener("DOMContentLoaded", scan);
})();
