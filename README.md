# 动手学智能体框架 · Dive into Agent Harness

> 一本**交互式书 + 刷题平台**：教你 agent harness——把 LLM 变成 agent 的那层框架。
> 方法论对标李沐《动手学深度学习》(D2L)：**可运行代码 + 由浅入深 + 边学边练**。

网站：`d2a.ai`（致敬 `d2l.ai`）

## 为什么做这个

大家并不熟悉 agent harness，导致用 LLM 效率不高——不管是个人开发，还是云端 agent。本书严格基于**真实主流 harness 源码**（opencode / codex / Claude Code / pi / deepseek-harness / corojaw / qwen-audio-agent 等）系统讲解，让你真正理解 agent 是怎么被「套起来驾驭」的。

## 特性

- 📖 **全书 8 章**：对标 D2L 的递进式结构（引言 → 核心循环 → 工具调用 → 上下文 → 沙箱 → 多 agent → 评测 → 前沿）
- 🧩 **分层表达**：每个概念覆盖直觉层（无代码图示）/ 机制层（核心代码）/ 源码层（真实 harness 精读）
- 🎨 **可探索图解**：8 张 archify 交互式 HTML 图（lifecycle / workflow / architecture），深/浅主题、可导出
- ✅ **刷题闭环**：24 道题，多邻国式即时反馈 + 粉笔式错题本 + 连续打卡 + 学习进度
- 🔍 **源码溯源**：每个结论追到 `文件:行号`（pi / deepseek-harness 源码 + cc source map 还原）
- 🚀 **可运行**：演示代码 + 真实源码 trace，边学边练

## 章节

| # | 章节 | 主案例 |
|---|------|--------|
| 0 | 引言：什么是 agent harness | — |
| 1 | 核心循环 | opencode |
| 2 | 工具调用 | codex |
| 3 | 上下文与记忆 | cc（Claude Code） |
| 4 | 沙箱与安全 | codex |
| 5 | 多 agent 编排 | opencode |
| 6 | 评测与可观测 | deepseek-harness |
| 7 | 前沿与生产 | xiaoaiclaw / coro |

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

本地不设 `DATABASE_URL` 时，刷题数据存本地 SQLite（`data/d2a.db`）。

## 部署

见 [DEPLOY.md](./DEPLOY.md)——Vercel 一键部署 + Turso 托管数据库 + 绑定 `d2a.ai`。

## 目录结构

```text
content/            # 章节（MDX，七段式结构）+ 术语表
src/                # 书站前端（Next.js）+ 数据层 + API
diagrams/           # archify 可探索图（candidate + 产物）
openspec/           # 单一事实来源（规格 / 决策 / 变更）
scripts/            # 工具脚本（视觉验证等）
```

## 贡献

本项目遵循 **Spec-Driven Development（SDD + OpenSpec）**，所有内容文档化存储，保证不同模型 / 用户 / 会话都能无缝接手。

1. 先读 [`openspec/project.md`](./openspec/project.md) 与 [`openspec/AGENTS.md`](./openspec/AGENTS.md)
2. 变更走 `openspec new change <name>`，proposal → specs → design → tasks
3. 章节生产遵循七段式 + 术语表 + 图解管线规范

## License

[MIT](./LICENSE)
