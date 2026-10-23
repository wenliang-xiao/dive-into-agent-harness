# 动手学智能体框架 · Dive into Agent Harness

> 一本**交互式书 + 刷题平台**：教你 agent harness——把 LLM 变成 agent 的那层框架。
> 方法论对标李沐《动手学深度学习》(D2L)：**可运行代码 + 由浅入深 + 边学边练**。

网站：`d2a.ai`（致敬 `d2l.ai`）

## 为什么做这个

大家并不熟悉 agent harness，导致用 LLM 效率不高——不管是个人开发，还是云端 agent。本书严格基于**真实主流 harness 源码**（opencode / codex / Claude Code / pi / durable-harness / openclaw 等）系统讲解，让你真正理解 agent 是怎么被「套起来驾驭」的。

## 特性

- 📖 **书**：对标 D2L 的递进式结构（核心循环 → 工具调用 → 上下文 → 沙箱 → 多 agent → 评测 → 前沿）
- 🧩 **分层表达**：每个概念覆盖直觉层（无代码图示）/ 机制层（核心代码）/ 源码层（真实 harness 精读）
- 🎨 **可探索图解**：archify 产出的交互式 HTML 图，深/浅主题、可导出
- ✅ **刷题**：多邻国式即时反馈 + 粉笔式题库/错题本/解析
- 🚀 **可运行**：演示代码 + 真实源码 trace，边学边练

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

## 目录结构

```text
content/            # 章节（MDX，七段式结构）
src/                # 书站前端（Next.js）
lib/store/          # 刷题数据层（Drizzle + SQLite）
diagrams/           # archify 可探索图
openspec/           # 单一事实来源（规格 / 变更 / 术语表）
```

## 贡献

本项目遵循 **Spec-Driven Development（SDD + OpenSpec）**，所有内容文档化存储，保证不同模型 / 用户 / 会话都能无缝接手。

1. 先读 [`openspec/project.md`](./openspec/project.md) 与 [`openspec/AGENTS.md`](./openspec/AGENTS.md)
2. 变更走 `openspec new change <name>`，proposal → specs → design → tasks
3. 章节生产遵循七段式 + 术语表 + 图解管线规范

## License

[MIT](./LICENSE)
