## Why

产品定位收敛：从「交互式书 + 刷题平台」改为「**纯学习网站（静态）**」。刷题闭环（36 道题、多邻国式即时反馈、粉笔式错题本、连续打卡、学习进度）意义不大，且其数据库在 Vercel serverless 只读文件系统上根本无法运行。刷题能力将**另起新项目**，不再进入本项目。

核心诉求：读者打开一个免费域名即可**在线看书 + 在线跑实验**，全程无需 clone / install / 本地起服务。

## What Changes

1. **移除刷题闭环**：删除数据库（SQLite/Drizzle/Turso）、`store` 数据层、quiz 逻辑与组件、进度/错题本页面、账号/打卡相关 API。
2. **移除进度/打卡 UI**：章节页的「标记完成/连续打卡」、导航栏「进度/错题本」入口、首页与元信息中的「刷题平台」表述。
3. **章节结构收敛**：9 章 MDX 去掉 `Quiz` 组件与 `getQuestions` 引用，保留正文、`CodeRunner`（在线实验）、`DiagramFrame`（图解）。
4. **保留薄代理**：`/api/run`（同源转发 LLM 请求 + SSE 流式 trace）是「在线跑实验」的唯一硬依赖，予以保留。读者**自带 API key**（存浏览器 localStorage），key 不落服务器。
5. **文档同步**：更新 `project.md` 定位/技术栈/章节结构/Roadmap、`DEPLOY.md`（去 Turso）、`README.md`，废弃 `decisions/0001-turso-managed-sqlite.md`。

## Capabilities

### Removed Capabilities
- `quiz-engine`: 刷题引擎（即时反馈 / 题库 / 错题本 / 连续打卡 / 服务端持久化）整体废弃，刷题另起项目。

### Modified Capabilities
- `book-shell`: 移除进度/错题本导航与章节完成打卡 UI；元信息去掉「刷题平台」。
- `content-system`: 每章七段式第 ⑥ 段由「练习/刷题」改为「练习/动手实验」，quiz 考核移除。

## Impact

- 删除依赖：`better-sqlite3`、`drizzle-orm`、`drizzle-kit`、`@libsql/client`、`@types/better-sqlite3`。
- 删除文件：`src/lib/store/`、`src/lib/quiz/`、`src/components/quiz.tsx`、`src/components/chapter-actions.tsx`、`src/app/progress/`、`src/app/mistakes/`、4 个刷题 API route。
- 修改文件：9 章 MDX、`layout.tsx`、`page.tsx`、`chapter/[slug]/page.tsx`、`package.json`、`project.md`、`DEPLOY.md`、`README.md`。
- 保留不变：`/api/run` 薄代理、`agent-loop.ts`、`code-runner.tsx`、`runner-config.tsx`、`diagram` 路由、全部章节正文。
