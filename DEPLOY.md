# 部署指南（Deploy）

本书是纯静态学习网站 + 一个无状态薄代理（`/api/run`），一键部署到 Vercel。**无需任何数据库、账号或外部服务。**

## 0. 前置

- 一个 Vercel 账号（可用 GitHub 登录）
- 读者的 LLM API key（读者在浏览器里填自己的 key，key 只存读者本地浏览器，不落服务器）

## 1. 部署到 Vercel

**方式 A：网页一键**（推荐）

1. 打开 https://vercel.com/new ，导入 `wenliang-xiao/dive-into-agent-harness`
2. 框架自动识别为 Next.js，直接 Deploy
3. 完成。无需配置任何环境变量。

**方式 B：CLI**

```bash
npm i -g vercel
vercel           # 首次部署，按提示关联项目
vercel --prod    # 生产部署
```

## 2. 在线跑实验（读者视角）

读者打开网站后，点右上角「⚙️ API」，填自己的：

- **Base URL**：任意 OpenAI 兼容接口（如 `http://model.mify.ai.srv/v1/`、`https://api.openai.com/v1`）
- **模型**：任意支持 function calling 的模型名
- **API Key**：读者自己的 key

配置存读者浏览器 localStorage，仅用于发起实验请求，由 `/api/run` 薄代理同源转发到 LLM（绕过浏览器 CORS），**key 不经过、不落服务器**。

## 3. 绑定自定义域名（可选）

`*.vercel.app` 部署域名在国内网络下可能不稳定，建议绑定自定义域名 + Cloudflare 托管：

1. 在 Vercel 项目 → Settings → Domains → Add 你的域名
2. 域名 DNS 用 Cloudflare 托管，A/CNAME 记录指向 Vercel
3. 拿到 `d2a.eu.org` 这类免费域名（eu.org 需人工审核）后即可替换

## 4. 本地开发（无需部署）

```bash
npm install
npm run dev        # http://localhost:3000
```

本地开发无需任何环境变量。若要本地跑通 `/api/run`，可在浏览器「⚙️ API」里填自己的 key；或临时 export `OPENAI_BASE_URL` / `OPENAI_API_KEY` / `OPENAI_MODEL` 供服务端默认值使用（勿提交到 git）。

## 5. 架构说明

- **纯静态**：全部章节 MDX 在构建时预渲染为静态 HTML（`/chapter/<slug>`）。
- **薄代理**：`/api/run` 是唯一动态路由，无状态、无存储，仅做同源转发 + SSE 流式 trace。
- **无数据库 / 无账号 / 无登录**：刷题闭环已整体移除（见 `openspec/changes/remove-quiz-static-site/`）。
