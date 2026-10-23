# 部署指南（Deploy）

本书是 Next.js 应用，支持一键部署到 Vercel，并绑定 `d2a.ai`。

## 0. 前置

- 一个 Vercel 账号（可用 GitHub 登录）
- 一个 Turso 账号（托管 SQLite，免费额度，用于刷题数据持久化）

## 1. 部署到 Vercel

**方式 A：网页一键**（推荐）

1. 打开 https://vercel.com/new ，导入 `wenliang-xiao/dive-into-agent-harness`
2. 框架自动识别为 Next.js，直接 Deploy
3. 部署完成后，在 Vercel 项目 Settings → Environment Variables 配置：
   - `DATABASE_URL`：Turso 数据库地址（`libsql://...`）
   - `DATABASE_AUTH_TOKEN`：Turso auth token
4. 重新 Deploy（或 Redeploy）使环境变量生效

**方式 B：CLI**

```bash
npm i -g vercel
vercel           # 首次部署，按提示关联项目
vercel --prod    # 生产部署
```

## 2. 创建 Turso 数据库

```bash
npm i -g turso
turso auth signup
turso db create d2a
turso db show d2a       # 拿到 URL（libsql://...）
turso db tokens create d2a   # 拿到 auth token
```

把 URL 和 token 填到 Vercel 环境变量 `DATABASE_URL`、`DATABASE_AUTH_TOKEN`。

## 3. 绑定域名 d2a.ai

1. 购买 `d2a.ai` 域名（任意域名商）
2. Vercel 项目 → Settings → Domains → Add `d2a.ai`
3. 按 Vercel 提示在域名商处添加 DNS 记录（A 记录或 CNAME）

## 4. 本地开发（无需部署）

```bash
npm install
npm run dev        # http://localhost:3000
```

本地不设 `DATABASE_URL` 时，自动使用本地 SQLite（`data/d2a.db`），无需任何配置。

## 5. 数据库说明

- **本地**：better-sqlite3，文件 `data/d2a.db`（已 gitignore）
- **部署**：设置 `DATABASE_URL` 后切 Turso（托管 SQLite，drizzle-orm/libsql）
- 两者共用同一套 drizzle schema，切换无需改代码
- 选型决策见 `openspec/decisions/0001-turso-managed-sqlite.md`

## 6. 从本地迁移数据到 Turso（可选）

```bash
# 本地 data/d2a.db 是标准 SQLite，可直接用 turso 导入
turso db shell d2a < dump.sql
```
