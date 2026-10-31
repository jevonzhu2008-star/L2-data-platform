/* 账号中心：显示当前账号 + 修改密码 */
(function () {
  "use strict";

  var form = document.getElementById("passwordForm");
  var oldPassword = document.getElementById("oldPassword");
  var newPassword = document.getElementById("newPassword");
  var newPassword2 = document.getElementById("newPassword2");
  var error = document.getElementById("error");
  var ok = document.getElementById("ok");
  var submitBtn = document.getElementById("submitBtn");
  var modeTip = document.getElementById("modeTip");
  var displayName = document.getElementById("displayName");
  var accountMeta = document.getElementById("accountMeta");
  var avatar = document.getElementById("avatar");
  var logoutBtn = document.getElementById("logoutBtn");

  var isApi = !!(window.L2Auth && L2Auth.mode === "api");

  function showError(msg) { error.textContent = msg; error.hidden = false; ok.hidden = true; }
  function showOk(msg) { ok.textContent = msg; ok.hidden = false; error.hidden = true; }
  function clearError() { error.hidden = true; }

  function render(username, display, role) {
    var name = display || username || "已登录";
    displayName.textContent = name;
    accountMeta.textContent = "账号 " + (username || "—") + " · " + (role === "admin" ? "管理员" : "普通用户");
    avatar.textContent = (name || "L2").slice(0, 1).toUpperCase();
  }

  function bindToggle(button, input) {
    button.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "隐藏" : "显示";
      button.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
    });
  }
  bindToggle(document.getElementById("toggleOld"), oldPassword);
  bindToggle(document.getElementById("toggleNew"), newPassword);

  logoutBtn.addEventListener("click", function () {
    if (window.L2Auth) L2Auth.logout();
    location.replace("login.html");
  });

  if (!isApi) {
    render(L2Auth.currentUser(), L2Auth.currentDisplayName(), L2Auth.currentRole());
    form.hidden = true;
    modeTip.hidden = false;
    modeTip.textContent = "当前离线版本使用内置账号，不支持在线修改密码。如需修改，请联系平台管理员在服务器或本机重新生成账号。";
    return;
  }

  render(L2Auth.currentUser(), L2Auth.currentDisplayName(), L2Auth.currentRole());
  L2Auth.session().then(function (info) {
    if (!info) return;
    render(info.username, info.displayName, info.role);
    if (info.mustChangePassword) {
      modeTip.hidden = false;
      modeTip.textContent = "管理员已为你重置密码，请立即设置新密码。";
    }
  }).catch(function (err) {
    if (err && err.status === 401) {
      location.replace("login.html?next=account.html");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    var oldPwd = oldPassword.value;
    var pwd = newPassword.value;
    var pwd2 = newPassword2.value;

    if (!oldPwd || !pwd) { showError("请填写当前密码和新密码"); return; }
    if (pwd.length < 8) { showError("新密码至少 8 位"); return; }
    if (pwd !== pwd2) { showError("两次输入的新密码不一致"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "提交中…";

    L2Auth.changePassword(oldPwd, pwd).then(function (data) {
      var extra = data && data.revokedOtherSessions > 0
        ? "其他设备（" + data.revokedOtherSessions + " 个会话）已自动退出登录。"
        : "";
      showOk("密码已更新。" + extra);
      oldPassword.value = "";
      newPassword.value = "";
      newPassword2.value = "";
      modeTip.hidden = true;
    }).catch(function (err) {
      if (err && err.code === "wrong_password") showError("当前密码不正确");
      else if (err && err.code === "same_password") showError("新密码不能与当前密码相同");
      else if (err && err.status === 401) { location.replace("login.html?next=account.html"); }
      else showError((err && err.message) || "修改失败，请稍后重试");
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "修改密码";
    });
  });

  [oldPassword, newPassword, newPassword2].forEach(function (el) {
    el.addEventListener("input", clearError);
  });
})();
