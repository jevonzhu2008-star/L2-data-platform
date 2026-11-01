#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GitHub Pages 自助注册：把 Issue 里的注册申请写进 assets/auth.config.js。

由 .github/workflows/account-register.yml 调用，环境变量：
  ISSUE_BODY     Issue 正文（包含 ```json 申请块）
  ISSUE_AUTHOR   发起人 GitHub 登录名
  ISSUE_NUMBER   Issue 编号
  GITHUB_OUTPUT  Actions 输出文件（status / username）

安全模型：申请里的 salt/hash 是浏览器本地算好的 PBKDF2 结果，仓库本来就是公开的，
账号哈希也不是秘密；这里的校验只保证格式正确、不被滥用，不提供真正的身份认证。
"""
from __future__ import annotations

import base64
import binascii
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

CONFIG = Path("assets/auth.config.js")
COMMENT = Path(".register_comment.md")
MESSAGE = Path(".register_message.txt")

USERNAME_RE = re.compile(r"^[A-Za-z0-9._-]{3,32}$")
MAX_ACCOUNTS_PER_USER = 3
MAX_ACCOUNTS_PER_DAY = 50
MIN_ITERATIONS = 10_000
MAX_ITERATIONS = 500_000


def set_output(name: str, value: str) -> None:
    path = os.environ.get("GITHUB_OUTPUT")
    if not path:
        return
    value = str(value).replace("\n", " ").replace("\r", " ")[:400]
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(f"{name}={value}\n")


def finish(status: str, comment: str, username: str = "") -> None:
    COMMENT.write_text(comment.strip() + "\n", encoding="utf-8")
    set_output("status", status)
    set_output("username", username)
    print(comment)
    sys.exit(0)


def parse_config(text: str) -> dict:
    match = re.search(r"window\.L2_AUTH\s*=\s*(\{.*\})\s*;", text, re.S)
    if not match:
        raise ValueError("无法解析 assets/auth.config.js")
    return json.loads(match.group(1))


def write_config(cfg: dict) -> None:
    lines = [
        "/* 自动生成，请勿手工编辑。用 tools/set_password.py 管理账号。 */",
        "window.L2_AUTH = {",
        f'  "mode": {json.dumps(cfg.get("mode", "local"))},',
        f'  "serverOnly": {"true" if cfg.get("serverOnly") else "false"},',
    ]
    if cfg.get("pagesRepo"):
        lines.append(f'  "pagesRepo": {json.dumps(cfg["pagesRepo"])},')
    lines.append(f'  "iterations": {int(cfg.get("iterations", 120000))},')
    lines.append('  "accounts": [')

    rows = []
    for account in cfg.get("accounts", []):
        parts = [
            f'"username": {json.dumps(account["username"], ensure_ascii=False)}',
            f'"salt": {json.dumps(account["salt"])}',
            f'"hash": {json.dumps(account["hash"])}',
            f'"iterations": {int(account.get("iterations", 120000))}',
        ]
        for extra in ("createdAt", "createdBy"):
            if account.get(extra):
                parts.append(f'"{extra}": {json.dumps(account[extra])}')
        rows.append("    {" + ", ".join(parts) + "}")

    lines.append(",\n".join(rows))
    lines.extend(["  ]", "};", ""])
    CONFIG.write_text("\n".join(lines), encoding="utf-8")


def extract_payload(body: str) -> dict:
    match = re.search(r"```json\s*(\{.*?\})\s*```", body or "", re.S)
    if not match:
        raise ValueError("没有找到注册信息。请使用平台注册页生成申请，或按模板粘贴注册块。")
    return json.loads(match.group(1))


def validate(payload: dict) -> tuple[str, str, int, str, str]:
    if payload.get("l2register") != 1:
        raise ValueError("注册块版本不正确（缺少 l2register: 1）")

    username = str(payload.get("username", "")).strip()
    if not USERNAME_RE.match(username):
        raise ValueError("账号需为 3-32 位字母、数字或 . _ -")

    display = "".join(ch for ch in str(payload.get("displayName", "")).strip() if ch.isprintable())
    display = display[:32] or username

    try:
        iterations = int(payload.get("iterations", 120000))
    except (TypeError, ValueError):
        raise ValueError("iterations 必须是整数")
    if not (MIN_ITERATIONS <= iterations <= MAX_ITERATIONS):
        raise ValueError(f"iterations 必须在 {MIN_ITERATIONS}–{MAX_ITERATIONS} 之间")

    try:
        salt = base64.b64decode(str(payload.get("salt", "")), validate=True)
        digest = base64.b64decode(str(payload.get("hash", "")), validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("salt / hash 不是合法的 Base64")
    if len(salt) != 16:
        raise ValueError("salt 必须是 16 字节")
    if len(digest) != 32:
        raise ValueError("hash 必须是 32 字节")

    return username, display, iterations, str(payload["salt"]), str(payload["hash"])


def main() -> None:
    body = os.environ.get("ISSUE_BODY", "")
    author = os.environ.get("ISSUE_AUTHOR", "").strip() or "unknown"
    number = os.environ.get("ISSUE_NUMBER", "")

    if not CONFIG.exists():
        finish("fail", "❌ 注册失败：仓库里找不到 `assets/auth.config.js`，请联系管理员。")

    text = CONFIG.read_text(encoding="utf-8")
    try:
        cfg = parse_config(text)
    except Exception as exc:  # noqa: BLE001
        finish("fail", f"❌ 注册失败：账号表格式异常（{exc}），请联系管理员。")

    try:
        payload = extract_payload(body)
        username, display, iterations, salt, digest = validate(payload)
    except Exception as exc:  # noqa: BLE001
        finish("fail", f"❌ 注册失败：{exc}\n\n请修改本 Issue 的正文后重新提交，或使用平台的注册页重新生成申请。")

    accounts = cfg.setdefault("accounts", [])
    if any(str(a.get("username", "")).lower() == username.lower() for a in accounts):
        finish("skip", f"ℹ️ 账号 `{username}` 已存在，无需重复提交。如果你忘记了密码，请联系管理员重置。",
               username)

    author_count = sum(1 for a in accounts if a.get("createdBy") == author)
    if author_count >= MAX_ACCOUNTS_PER_USER:
        finish("fail", f"❌ 注册失败：每个 GitHub 账号最多注册 {MAX_ACCOUNTS_PER_USER} 个平台账号。", username)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = sum(1 for a in accounts if str(a.get("createdAt", "")).startswith(today))
    if today_count >= MAX_ACCOUNTS_PER_DAY:
        finish("fail", "❌ 注册失败：今日平台注册名额已用完，请明天再试或联系管理员。", username)

    accounts.append({
        "username": username,
        "salt": salt,
        "hash": digest,
        "iterations": iterations,
        "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "createdBy": author,
    })
    accounts.sort(key=lambda a: str(a.get("username", "")).lower())
    cfg["accounts"] = accounts
    write_config(cfg)

    MESSAGE.write_text(f"注册账号 {username}（#{number}，by {author}）\n", encoding="utf-8")
    finish(
        "ok",
        f"✅ 注册成功：`{username}`（{display}）\n\n"
        f"GitHub Pages 约 1 分钟后完成重建，届时回到平台用刚才设置的账号密码登录即可。\n"
        f"忘记密码请联系管理员重置。",
        username,
    )


if __name__ == "__main__":
    main()
