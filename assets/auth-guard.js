/* 未登录时拦截平台页面（前端门禁；不能阻止直接访问静态文件） */
(function () {
  "use strict";
  var KEY = "l2_auth_token";
  var ok = false;
  try {
    var stores = [sessionStorage, localStorage];
    for (var i = 0; i < stores.length && !ok; i++) {
      var raw = stores[i].getItem(KEY);
      if (!raw) continue;
      var t = JSON.parse(raw);
      if (t && t.exp > Date.now()) ok = true;
    }
  } catch (e) {
    ok = false;
  }
  if (ok) return;

  var next = location.pathname.split("/").pop() || "index.html";
  if (location.search) next += location.search;
  if (location.hash) next += location.hash;
  location.replace("login.html?next=" + encodeURIComponent(next));
})();
