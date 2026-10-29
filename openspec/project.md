# Project Context · Dive into Agent Harness

> 本文件是项目的**单一事实来源**。任何模型 / 用户 / 会话在本仓库动手前，必须先读本文件与 [AGENTS.md](./AGENTS.md)。

## 一句话

《动手学智能体框架》（Dive into Agent Harness）：一本**交互式书 + 刷题平台**，教 **agent 完整系统 = LLM + harness**——把 LLM 变成 agent 的那层框架，并贯通它的上游（算法与模型）与下游（推理部署、RL 训练闭环）。方法论对标李沐《动手学深度学习》（D2L）的三件套：**可运行代码 + 由浅入深 + 边学边练**；刷题层融合**多邻国**（游戏化 / 连击 / 间隔重复）与**粉笔网**（题库 / 错题本 / 解析 / 模考）范式。

## 命名三件套

| 项 | 名字 |
|----|------|
| 书名 | 《动手学智能体框架》（英文 Dive into Agent Harness） |
| 网站 | `d2a.ai`（Dive into Agents，呼应李沐 `d2l.ai`） |
| 项目 repo | `wenliang-xiao/dive-into-agent-harness` |

## 定位与差异化

| 维度 | 现状痛点 | 本书解法 |
|------|---------|---------|
| agent 系统认知 | 大家不熟 harness 层，把它当孤立框架；不知 agent = LLM + harness 且与算法 / 推理 / 训练贯通（个人开发 + 云端 agent 双视角） | 严格基于**真实主流 harness 源码**系统讲解，由浅入深，并贯通上游算法与下游推理 / 训练 |
| 学习体验 | 文档零散、只读不练 | 书 + 刷题一体，边学边练，游戏化 + 题库双引擎 |
| 读者门槛 | 源码分析受众窄 | 内容**分层表达**，全人群覆盖 |

## 目标读者（全人群，分层表达）

下限是「用过豆包 / workbuddy 等 AI 工具、有产品理解」的人，不要求会写代码。每个概念走三层：

1. **直觉层**（无代码，图示 + 类比，给产品 / 运营）
2. **机制层**（核心代码 + 代码形状，给开发者）
3. **源码层**（真实 harness 精读，给造轮子的人）

> 推论：图示 / 可视化不是装饰，而是服务零代码读者的**刚需**。

## 素材清单（严格基于真实主流 harness）

| 项目 | 类型 | 语言 | 说明 |
|------|------|------|------|
| opencode | 开源 | TS | 主案例（消息循环 / subagent） |
| codex（OpenAI Codex CLI） | 开源 | Rust | 主案例（工具调用 / 沙箱） |
| cc（Claude Code） | 闭源·source map 还原 | TS | 主案例（上下文 / 记忆），标注「基于 source map 还原，非官方源码」 |
| pi-agent | 开源 | TS | 对照案例（沙箱 / 安全） |
| deepseek-harness | 开源 | TS/Python | 主案例（第 6 章评测 benchmark / 第 9 章训练与部署闭环：配合 DeepSeek V4.1 的耦合案例） |
| durable-harness | 开源 | TS | 对照案例（durable execution，第 5 章多 agent 编排） |
| openclaw | 开源 | TS | 对照案例 |
| hermes（hermes-investment） | 内部 | Python | 对照案例 |
| qwen-audio-agent | 开源 | TS | 前沿（多模态 agent） |
| xiaoaiclaw | 云端 | TS | 前沿（生产化） |
| corojaw | 云端 | Java | 前沿（生产化，gateway/loop/model/session/tool 多模块） |

> cc 的素材来源：《Claude code 代码泄露》飞书深度分析（40 工具 / 101 指令 / Agent Loop / Context Engineering / Memory / 工具系统）+ 其附录完整版《Claude-Code-Harness 技术深度分析.md》。

## 章节结构（对标 D2L 递进式）

D2L 的演进逻辑是「模型越来越强」，映射为「agent 能力越来越强」：

| D2L 结构 | 本书章节 | 主案例 | 对照 |
|---------|---------|--------|------|
| 预备知识 | 引言 + LLM 基础 + 环境搭建 | — | — |
| 线性回归（最简起点） | 核心循环：一个 LLM + 一个消息循环 = 最简 agent | opencode | pi |
| 多层感知机（引入能力） | 工具调用：function calling / 工具定义 / 执行 / 回传 | codex | opencode |
| CNN（处理结构） | 上下文与记忆：上下文窗口 / compaction / 检索 / 文件系统 | cc | opencode |
| RNN（时序序列） | 沙箱与安全：命令隔离 / 权限 / 审批流 | codex | pi |
| 注意力机制（选择性关注） | 多 agent 编排：subagent / 任务分解 / 并行 | opencode | cc Task |
| 优化算法（衡量/调优） | 评测与可观测：benchmark / trace / telemetry / 成本 | deepseek-harness | corojaw |
| Transformer（前沿） | 前沿与生产：多模态 / MCP 生态 / 云端生产化 | xiaoaiclaw / coro | 全景横评 |
| 计算性能与部署（闭环） | 训练与部署闭环：trajectory 可观测 / RL 训练 / PD 分离 | deepseek-harness | corojaw / xiaoaiclaw |

## 每章结构（对标 D2L 细节程度）

```
① 动机      —— 为什么需要这个机制（真实场景痛点）
② 直觉层    —— eli5 / archify 大图，零代码能懂
③ 机制层    —— show-me 代码形状 + [演示代码 A / 源码精读 B / 实验 C]
④ 源码层    —— 真实 harness annotated 源码（对应 D2L「简洁实现」）
⑤ 小结      —— takeaways
⑥ 练习/刷题 —— 多邻国式即时反馈 + 粉笔式章节测验
⑦ 延伸阅读  —— 参考文献 + 相关项目
```

**每章源码层执行「源码精读三段式」**：① 真实源码 annotated 行级注释 ② 一段真实 trace / 数据流实例 ③ 与 `d2a-harness` 从零实现的逐点映射（「真实源码这行 = 我 step-0X 那行」）。

**每章末尾给「可自测 check 清单」**：读者能跑通 / 能答出的验收项（对齐 D2L「边学边练」的回忆性，而非纯识别）。

「动手」方式**按章节特性选侧重**（不搞一刀切）：

| 章节 | 侧重 |
|------|------|
| 核心循环 / 工具调用 | A（原理简单，50~100 行演示代码讲透） |
| 上下文管理 / 沙箱安全 | B（真实实现复杂，主打源码精读 + trace） |
| 多 agent / 评测 / 生产化 | C（在真实 harness 上做实验） |

## 技术栈

| 层 | B 阶段（现在） | C 阶段（未来） |
|----|--------------|--------------|
| 书内容 | MDX（Markdown + 交互组件） | 同左，章节体系化 |
| 前端 | Next.js（App Router） | 演进为前后端分离 |
| 后端 | Next.js API Routes（轻） | 独立后端服务 |
| 数据库 | Drizzle ORM 抽象，本地 better-sqlite3、部署切 Turso 托管 SQLite（见 ADR-0001） | 完整账号/排行/社区 |
| 刷题数据 | 进度/错题本/连续打卡**服务端持久化**（多设备 + 排行榜） | 粉笔式完整题库平台 |
| 部署 | Vercel 一键部署 | 自建/云 |

> 关键约定：进度/错题本统一走一个 `store` 接口，C 阶段扩展时 UI 不动。

## 开发范式

1. **SDD + OpenSpec**：spec-driven，`openspec/` 是唯一事实来源，proposal → specs → design → tasks → archive。
2. **trellis**：工作流框架 + `channel` 多 agent 协作，`.trellis/` 是本地工作区（不提交）。
3. **superpowers**：`writing-skills`（skill 写作 = TDD，RED-GREEN-REFACTOR）作为本书「章节生产 skill」的元规范。

## 内容生产 skill 选型

| skill | 用途 | 对应书层 |
|-------|------|---------|
| archify | 可探索 HTML 图（架构/工作流/时序/数据流/生命周期） | 核心图解 |
| eli5 | 零基础大图少字 | 直觉层 |
| show-me | 最小视图（伪代码/调用树/组件树/mermaid） | 机制层 |
| html-beautify | 编辑部式排版、响应式、打印 | 全书视觉语言 |
| techdoc | 理解路径、去冗余、中文用词规范 | 每章写作规范 |
| domain-modeling | DDD 统一语言、术语表 | 全书术语统一 |
| svg-diagram-design | SVG 布局修复 | 兜底 |

## 常用命令

```bash
# 开发
npm install && npm run dev          # 启动书站（http://localhost:3000）

# OpenSpec
openspec new change <name>          # 新建变更提案
openspec validate                   # 校验规格
openspec archive <change-name>      # 归档已完成的变更

# trellis
trellis workflow list               # 查看/切换工作流
```

## 路线图（Roadmap）

| 阶段 | 内容 | 状态 |
|------|------|------|
| P0 | 项目骨架 + OpenSpec 规格 + 内容体系定型 | 进行中 |
| P1 | 书站框架（Next.js + MDX）+ 前 2 章（核心循环 / 工具调用） | 计划中 |
| P2 | 完整章节（9 章，含训练与部署闭环）+ archify 图解体系 + 刷题引擎（多邻国式 + 粉笔式） | 计划中 |
| P3 | 云端同步 / 排行榜 / 账号（B→C 演进） | 计划中 |
