# 动手学智能体框架 · Dive into Agent Harness

> 一本**交互式学习网站**：教你 **agent harness**——把 LLM 变成 agent 的那层框架，并贯通上游（算法与模型）与下游（推理部署、RL 训练闭环）。
> 方法论对标李沐《动手学深度学习》(D2L)：**可运行代码 + 由浅入深 + 边学边动手**。

网站：`dive-into-agent-harness-nwyqapil7-wenlix.vercel.app`（`d2a.ai` 为未来正式域名）

> **9 章 · 11 张可探索图解 · Next.js / TypeScript** — 免费、开源、MIT。

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=fafaf5" alt="MIT License"></a>
  <a href="#contents"><img src="https://img.shields.io/badge/chapters-9-3553ff?style=flat-square&labelColor=fafaf5" alt="9 chapters"></a>
  <a href="#contents"><img src="https://img.shields.io/badge/diagrams-11-3553ff?style=flat-square&labelColor=fafaf5" alt="11 diagrams"></a>
  <a href="https://github.com/wenliang-xiao/dive-into-agent-harness/stargazers"><img src="https://img.shields.io/github/stars/wenliang-xiao/dive-into-agent-harness?style=flat-square&labelColor=fafaf5&color=3553ff" alt="GitHub stars"></a>
  <a href="https://dive-into-agent-harness-nwyqapil7-wenlix.vercel.app"><img src="https://img.shields.io/badge/web-vercel.app-3553ff?style=flat-square&labelColor=fafaf5" alt="Website"></a>
</p>

## 为什么做这个

大家并不熟悉 harness 层——把 LLM 变成 agent 的那层框架。不管是个人开发还是云端 agent，用不好 harness，LLM 效率就上不去。

本书严格基于**真实主流 harness 源码**（opencode / codex / Claude Code / pi / deepseek-harness / openclaw / qwen-audio-agent 等）系统讲解，让你真正理解 agent 是怎么被「套起来驾驭」的，而不是把 harness 当成一个孤立框架。

## 特性

- 📖 **全书 9 章**：对标 D2L 的递进式结构（引言 → 核心循环 → 工具调用 → 上下文 → 沙箱 → 多 agent → 评测 → 前沿 → 训练与部署闭环）
- 🧩 **分层表达**：每个概念覆盖直觉层（无代码图示）/ 机制层（核心代码）/ 源码层（真实 harness 精读），服务全人群读者
- 🎨 **可探索图解**：11 张 archify 交互式 HTML 图（lifecycle / workflow / architecture），深/浅主题、可导出
- ⚡ **在线实验**：每章末的「实验」可在线改参数、真实跑核心循环，SSE 流式观察 trace（读者自带 API key，不落服务器）
- 🔍 **源码溯源**：每个结论追到 `文件:行号`（pi / deepseek-harness 源码 + cc source map 还原）
- 🚀 **纯静态**：无数据库、无账号、无登录，一键部署 Vercel

<a id="contents"></a>

## 章节目录

| # | 章节 | 主案例 | 对照案例 | 动手侧重 |
|---|------|--------|---------|---------|
| 0 | 引言：什么是 agent harness | — | — | 演示代码 |
| 1 | 核心循环：一个 LLM + 一个消息循环 = 最简 agent | opencode | pi | 演示代码 |
| 2 | 工具调用：function calling / 定义 / 执行 / 回传 | codex | opencode | 演示代码 |
| 3 | 上下文与记忆：上下文窗口 / compaction / 检索 / 文件系统 | cc（Claude Code） | opencode | 源码精读 |
| 4 | 沙箱与安全：命令隔离 / 权限 / 审批流 | codex | pi | 源码精读 |
| 5 | 多 agent 编排：subagent / 任务分解 / 并行 | opencode | cc Task | 实验 |
| 6 | 评测与可观测：benchmark / trace / telemetry / 成本 | deepseek-harness | openclaw | 实验 |
| 7 | 前沿与生产：多模态 / MCP 生态 / 云端生产化 | openclaw / qwen-audio-agent | 全景横评 | 实验 |
| 8 | 训练与部署闭环：trajectory 可观测 / RL 训练 / PD 分离 | deepseek-harness | openclaw / qwen-audio-agent | 实验 |

> 每章七段式结构：①动机 → ②直觉层 → ③机制层 → ④源码层 → ⑤小结 → ⑥练习/动手实验 → ⑦延伸阅读。

## 交互式体验

### 可探索图解

每章核心机制都有一张 archify 交互式 HTML 图，支持深/浅主题、拖拽缩放、导出 PNG/SVG。例如：

- 核心循环 `agent-loop`、工具调用 `tool-calling` / `execution-chain`
- 上下文压缩 `compaction`、沙箱权限 `permission`
- 多 agent 编排 `coordinator`、评测 `benchmark`、术语接地 `grounding`

> 图示不是装饰，而是服务零代码读者的刚需——直觉层读者只看图也能懂。

### 在线实验

每章末的「实验」可在线改参数（轮数上限 / 系统提示 / 工具名 / 子任务等），真实跑一遍核心循环，左侧代码逐行高亮、右侧 SSE 流式打印 trace。读者在右上角「⚙️ API」填自己的 LLM key（存浏览器 localStorage），无需 clone、无需本地起服务。

## 怎么学

**在网站上**：打开 [dive-into-agent-harness-nwyqapil7-wenlix.vercel.app](https://dive-into-agent-harness-nwyqapil7-wenlix.vercel.app) 直接读章节、看图解、跑实验，无需 clone。

> ⚠️ 国内访问需挂 VPN：Vercel 无中国大陆节点，`*.vercel.app` 域名国内被 DNS 污染（见 [DEPLOY.md](./DEPLOY.md) 第 3 节的自定义域名方案）。

**本地运行**：clone 下来跑 `npm run dev` 即可，零配置、零数据库。

**参与贡献**：按 Spec-Driven Development（OpenSpec）协作，见下方「贡献」。

## 快速开始

```bash
git clone https://github.com/wenliang-xiao/dive-into-agent-harness.git
cd dive-into-agent-harness
npm install
npm run dev        # http://localhost:3000
```

## 部署

见 [DEPLOY.md](./DEPLOY.md)——Vercel 一键部署（纯静态 + 无状态薄代理），无需数据库。

## 目录结构

```text
content/            # 章节（MDX，七段式结构）+ 术语表
src/                # 书站前端（Next.js）+ /api/run 薄代理
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
