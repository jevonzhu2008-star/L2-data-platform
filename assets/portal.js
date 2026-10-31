/* 账号管理后台（仅管理员） */
(function () {
  "use strict";

  var isApi = !!(window.L2Auth && L2Auth.mode === "api");
  var isAdmin = !!(window.L2Auth && L2Auth.isAdmin && L2Auth.isAdmin());

  var usersPanel = document.getElementById("usersPanel");
  var auditPanel = document.getElementById("auditPanel");
  var deniedPanel = document.getElementById("deniedPanel");
  var tabUsers = document.getElementById("tabUsers");
  var tabAudit = document.getElementById("tabAudit");
  var tabs = document.querySelector(".tabs");

  var usersBody = document.getElementById("usersBody");
  var auditBody = document.getElementById("auditBody");
  var searchInput = document.getElementById("searchInput");
  var auditSearch = document.getElementById("auditSearch");
  var refreshBtn = document.getElementById("refreshBtn");
  var auditRefresh = document.getElementById("auditRefresh");
  var pagerText = document.getElementById("pagerText");
  var prevPageBtn = document.getElementById("prevPage");
  var nextPageBtn = document.getElementById("nextPage");
  var usersHint = document.getElementById("usersHint");
  var statTotal = document.getElementById("statTotal");
  var statAdmins = document.getElementById("statAdmins");
  var statDisabled = document.getElementById("statDisabled");
  var whoami = document.getElementById("whoami");
  var toastEl = document.getElementById("toast");

  var secretMask = document.getElementById("secretMask");
  var secretValue = document.getElementById("secretValue");

  var state = { q: "", page: 1, size: 50, total: 0 };
  var currentUser = L2Auth.currentUser();

  whoami.textContent = (L2Auth.currentDisplayName() || currentUser) + (isAdmin ? " · 管理员" : "");

  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    L2Auth.logout();
    location.replace("login.html");
  });

  if (!isApi) {
    showDenied("当前离线版本（GitHub Pages / 桌面版）没有账号服务，无法使用管理后台。请在内网 IIS 版本中打开。");
    return;
  }
  if (!isAdmin) {
    showDenied("当前账号不是管理员，无权访问本页面。如需权限请联系管理员。");
    return;
  }

  function showDenied(message) {
    tabs.hidden = true;
    usersPanel.hidden = true;
    auditPanel.hidden = true;
    deniedPanel.hidden = false;
    var p = deniedPanel.querySelector("p");
    if (p) p.textContent = message;
  }

  /* ------------------------------ 通用 ------------------------------ */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("zh-CN", { hour12: false });
  }

  var toastTimer = null;
  function toast(message, isError) {
    toastEl.textContent = message;
    toastEl.className = "toast show" + (isError ? " err" : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = "toast"; }, 2600);
  }

  function fail(err) {
    if (err && err.status === 401) {
      location.replace("login.html?next=admin.html");
      return;
    }
    if (err && err.status === 403) {
      showDenied("当前账号不是管理员，无权访问本页面。");
      return;
    }
    toast((err && err.message) || "操作失败", true);
  }

  /* ------------------------------ 用户列表 ------------------------------ */

  function loadUsers() {
    usersHint.textContent = "加载中…";
    var path = "api/admin/users?size=" + state.size + "&page=" + state.page;
    if (state.q) path += "&q=" + encodeURIComponent(state.q);
    L2Auth.api(path, "GET").then(function (data) {
      state.total = data.total || 0;
      renderUsers(data.items || []);
      if (data.stats) {
        statTotal.textContent = data.stats.total;
        statAdmins.textContent = data.stats.admins;
        statDisabled.textContent = data.stats.disabled;
      }
      var pages = Math.max(1, Math.ceil(state.total / state.size));
      pagerText.textContent = "第 " + state.page + " / " + pages + " 页 · 共 " + state.total + " 个";
      prevPageBtn.disabled = state.page <= 1;
      nextPageBtn.disabled = state.page >= pages;
      usersHint.textContent = state.total === 0 ? "没有匹配的账号" : "";
    }).catch(function (err) {
      usersHint.textContent = "";
      usersBody.innerHTML = "";
      fail(err);
    });
  }

  function renderUsers(items) {
    if (!items.length) {
      usersBody.innerHTML = '<tr><td colspan="7"><div class="empty">没有匹配的账号</div></td></tr>';
      return;
    }
    var html = "";
    items.forEach(function (u) {
      var locked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
      var self = String(u.username).toLowerCase() === String(currentUser).toLowerCase();
      var roleBadge = u.role === "admin"
        ? '<span class="badge admin">管理员</span>'
        : '<span class="badge user">用户</span>';
      var statusBadge = u.status === "disabled"
        ? '<span class="badge disabled">已禁用</span>'
        : '<span class="badge active">正常</span>';
      if (locked) statusBadge += ' <span class="badge locked">已锁定</span>';

      var actions = [];
      if (!self) {
        actions.push('<button class="btn small" data-action="' + (u.status === "disabled" ? "enable" : "disable") +
          '" data-user="' + esc(u.username) + '">' + (u.status === "disabled" ? "启用" : "禁用") + "</button>");
        actions.push('<button class="btn small" data-action="setRole" data-role="' +
          (u.role === "admin" ? "user" : "admin") + '" data-user="' + esc(u.username) + '">' +
          (u.role === "admin" ? "取消管理员" : "设为管理员") + "</button>");
      }
      actions.push('<button class="btn small" data-action="resetPassword" data-user="' + esc(u.username) + '">重置密码</button>');
      if (locked) {
        actions.push('<button class="btn small" data-action="unlock" data-user="' + esc(u.username) + '">解锁</button>');
      }
      actions.push('<button class="btn small" data-action="forceLogout" data-user="' + esc(u.username) + '">强退</button>');
      if (!self) {
        actions.push('<button class="btn small danger" data-action="delete" data-user="' + esc(u.username) + '">删除</button>');
      }

      html += "<tr>" +
        '<td class="mono">' + esc(u.username) + (self ? ' <span class="muted">(我)</span>' : "") + "</td>" +
        '<td class="wrap">' + esc(u.displayName || u.username) + "</td>" +
        "<td>" + roleBadge + "</td>" +
        "<td>" + statusBadge + (u.mustChangePassword ? ' <span class="badge locked">待改密</span>' : "") + "</td>" +
        '<td class="nowrap">' + formatTime(u.lastLoginAt) + "</td>" +
        '<td class="nowrap">' + formatTime(u.createdAt) + "</td>" +
        '<td><div class="row-actions">' + actions.join("") + "</div></td>" +
        "</tr>";
    });
    usersBody.innerHTML = html;
  }

  usersBody.addEventListener("click", function (e) {
    var button = e.target.closest ? e.target.closest("button[data-action]") : null;
    if (!button) return;
    var action = button.getAttribute("data-action");
    var user = button.getAttribute("data-user");
    var role = button.getAttribute("data-role");

    if (action === "delete") {
      if (!confirm("确认删除账号「" + user + "」？删除后该账号立即失效，此操作不可恢复。")) return;
    }
    if (action === "resetPassword") {
      if (!confirm("确认重置「" + user + "」的密码？系统会生成一个临时密码，该用户当前所有登录会失效。")) return;
    }
    if (action === "disable") {
      if (!confirm("确认禁用「" + user + "」？该账号将立即退出并无法登录。")) return;
    }

    var payload = { action: action, username: user };
    if (action === "setRole") payload.role = role;
    if (action === "resetPassword") payload.password = "";

    button.disabled = true;
    L2Auth.api("api/admin/user", "POST", payload).then(function (data) {
      if (action === "resetPassword") {
        showSecret(data.password || "", user);
        toast("已重置「" + user + "」的密码");
      } else if (action === "delete") {
        toast("已删除「" + user + "」");
      } else if (action === "setRole") {
        toast("已把「" + user + "」设为" + (role === "admin" ? "管理员" : "普通用户"));
      } else if (action === "forceLogout") {
        toast("已强制退出「" + user + "」的 " + (data.revoked || 0) + " 个会话");
      } else {
        toast("操作完成");
      }
      loadUsers();
    }).catch(function (err) {
      button.disabled = false;
      fail(err);
    });
  });

  /* ------------------------------ 临时密码 ------------------------------ */

  function showSecret(password, user) {
    document.getElementById("secretTitle").textContent = "临时密码 · " + user;
    secretValue.textContent = password || "（请指定新密码）";
    secretMask.hidden = false;
  }

  document.getElementById("closeSecret").addEventListener("click", function () {
    secretMask.hidden = true;
  });

  document.getElementById("copySecret").addEventListener("click", function () {
    var text = secretValue.textContent || "";
    function done() { toast("临时密码已复制"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { toast("复制失败，请手动选择", true); });
      return;
    }
    var range = document.createRange();
    range.selectNodeContents(secretValue);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try { document.execCommand("copy"); done(); }
    catch (e) { toast("复制失败，请手动选择", true); }
  });

  /* ------------------------------ 审计日志 ------------------------------ */

  function loadAudit() {
    auditBody.innerHTML = '<tr><td colspan="6"><div class="empty">加载中…</div></td></tr>';
    var path = "api/admin/audit?limit=200";
    if (auditSearch.value.trim()) path += "&action=" + encodeURIComponent(auditSearch.value.trim());
    L2Auth.api(path, "GET").then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        auditBody.innerHTML = '<tr><td colspan="6"><div class="empty">暂无记录</div></td></tr>';
        return;
      }
      var html = "";
      items.forEach(function (e) {
        html += "<tr>" +
          '<td class="nowrap">' + esc(formatTime(e.ts)) + "</td>" +
          '<td class="mono">' + esc(e.actor) + "</td>" +
          '<td class="mono">' + esc(e.action) + "</td>" +
          '<td class="mono">' + esc(e.target) + "</td>" +
          '<td class="mono">' + esc(e.ip) + "</td>" +
          '<td class="wrap muted">' + esc(e.detail ? JSON.stringify(e.detail) : "") + "</td>" +
          "</tr>";
      });
      auditBody.innerHTML = html;
    }).catch(function (err) {
      auditBody.innerHTML = "";
      fail(err);
    });
  }

  /* ------------------------------ 交互 ------------------------------ */

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value.trim();
      state.page = 1;
      loadUsers();
    }, 250);
  });
  refreshBtn.addEventListener("click", loadUsers);
  prevPageBtn.addEventListener("click", function () {
    if (state.page > 1) { state.page--; loadUsers(); }
  });
  nextPageBtn.addEventListener("click", function () {
    if (state.page * state.size < state.total) { state.page++; loadUsers(); }
  });

  auditRefresh.addEventListener("click", loadAudit);
  var auditTimer = null;
  auditSearch.addEventListener("input", function () {
    if (auditTimer) clearTimeout(auditTimer);
    auditTimer = setTimeout(loadAudit, 250);
  });

  tabUsers.addEventListener("click", function () { switchTab("users"); });
  tabAudit.addEventListener("click", function () { switchTab("audit"); });

  function switchTab(name) {
    var users = name === "users";
    usersPanel.hidden = !users;
    auditPanel.hidden = users;
    tabUsers.className = users ? "tab on" : "tab";
    tabAudit.className = users ? "tab" : "tab on";
    if (users) loadUsers();
    else loadAudit();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !secretMask.hidden) secretMask.hidden = true;
  });

  loadUsers();
})();
