/* Microsoft Entra ID (Azure AD) 单点登录配置
 * clientId 由 Entra 应用注册提供；留空时登录页会提示“SSO 待配置”，仍可用演示账号本地登录。
 */
window.L2_SSO = {
  clientId: "fd73716f-dc01-44e3-9ede-77acb8391bcd",
  authority: "https://login.microsoftonline.com/b2da9cb2-59ba-4d33-b075-1cb745ddde1c",
  redirectUri: location.origin + location.pathname.replace(/[^/]*$/, "login.html"),
  postLogoutRedirectUri: location.origin + location.pathname.replace(/[^/]*$/, "login.html"),
  scopes: ["openid", "profile", "email"]
};
