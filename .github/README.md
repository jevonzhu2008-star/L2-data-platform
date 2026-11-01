# GitHub Pages 自助注册

本目录让部署在 GitHub Pages 上的平台支持"用户自己注册账号"，不需要任何服务器。

## 工作原理

```
平台注册页（login.html）
  ├─ 浏览器本地计算 salt + PBKDF2-SHA256 哈希（密码明文不出本机）
  └─ 打开预填好的 GitHub Issue（标题以 [注册] 开头，正文含 ```json 注册块）
        ↓ 用户点 Submit new issue
GitHub Actions（.github/workflows/account-register.yml）
  ├─ 校验格式 / 重名 / 频率（每人最多 3 个、每天最多 50 个）
  ├─ 把账号写进 assets/auth.config.js 并提交推送
  ├─ 在 Issue 里回复结果并关闭 Issue
        ↓ 30–60 秒
GitHub Pages 重建，注册页点"检查是否生效"即可自动登录
```

账号表里只有 `salt` 与 `hash`（PBKDF2-SHA256 / 120000 次），没有明文密码。

## 仓库需要满足的条件

1. **Issues 已开启**（仓库 Settings → General → Features → Issues）
2. **Actions 已允许运行**（Actions 标签页首次需要点一次启用）
3. 工作流文件在默认分支上（合并到 `main` 后才会对 Issue 事件生效）
4. 仓库设置 → Actions → General → Workflow permissions：
   - 允许 **Read and write permissions**（或至少允许 `contents: write`、`issues: write`）
   - 组织策略若限制为只读，需要管理员放开
5. GitHub Pages 配置为从 `main` 分支发布，工作流推送后会自动重建

## 管理账号

- 新增/删除账号：直接编辑 `assets/auth.config.js`（或在本仓库的 Issue 里让工作流处理）
- 停用某个账号：从账号数组里删除对应条目即可（下次 Pages 重建后生效）
- 查看注册来源：账号条目里的 `createdBy` 是提交者的 GitHub 登录名，`createdAt` 是 UTC 时间

## 注意

- 这是**门禁**而不是安全边界：`assets/data.js`、截图、PBIX 仍然公开可下载；账号哈希本身也是公开的。
- Issue 里只包含哈希，不含密码；但仍建议用户不要在 Issue 里补充其他个人信息。
- 本地 `tools/auto_update.py` 发布时**不会覆盖** `assets/auth.config.js`（已在 `GITHUB_SYNC_EXCLUDE` 中排除），
  否则自助注册的账号会在下一次发布时被抹掉。
- 工作流推送与本地发布可能撞车：工作流会 `pull --rebase` 重试，本地 `auto_update.py` 也会在推送被拒后 rebase 重试。
