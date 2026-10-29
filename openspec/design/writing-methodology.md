# 写作方法论调研（对标 D2L 写书）

> 本文件是「如何把本书内容提升到对标李沐《动手学深度学习》(D2L) 深度」的调研结论与行动项。
> 供后续 session 接手内容优化时直接使用。

## 调研背景

- **目标**：让《动手学智能体框架》的内容「整体和细节都对标 D2L」。
- **当前状态**：9 章已按「核心循环章定稿标准」重写——每章 = 根源理解（第一性原理）+ 从零实现（d2a-harness step-XX）+ 对照基准（自解释 archify 图 + annotated 真实源码）+ 可编辑实验（CodeRunner）+ 编程练习。
- **瓶颈判断**：结构已对齐 D2L，但缺少「写书粒度」的方法论来突破细节深度。内容到了一个平台期。

## 调研的 skill 清单

### 本地 skill（`~/.agents/skills/`）

| skill | 核心方法论 | 对写书的价值 |
|-------|-----------|-------------|
| **teach** | Fluency vs Storage Strength；Zone of Proximal Development；Knowledge vs Skills；反馈循环 | 教学哲学：记忆、难度、练习设计 |
| **writing-shape** | **Grounding（接地）**；段落逐段生长；格式论证 | 概念依赖管理；格式选择要刻意 |
| **writing-beats** | **Grounding**；beat-by-beat 旅程 | 概念接地顺序 |
| **writing-great-skills** | Information hierarchy；Progressive disclosure；Leading words；Pruning；单一真相来源 | 信息分层；术语单一来源 |
| **techdoc** | 理解路径、去冗余、FAQ 原则、中文用词规范 | 每章写作规范 |
| **humanizer** | 去 AI 味 | 润色 |

### Matt Pocock skills（`mattpocock/skills`，skills.sh 29.7M 下载）

来源：https://www.aihero.dev/skills-setup-matt-pocock-skills

核心哲学：

1. **「配置是 markdown，skill 本身跨 repo 完全一致」**——skill 运行时不改逻辑，只读 `docs/agents/*.md`（issue-tracker.md / domain.md / triage-labels.md），那些 markdown 才是每个 repo 唯一不同的东西。
2. **「Skills stay opinionated, no per-user config」**——规范要有主见、不妥协；偏好属于 CLAUDE.md，不提供 per-user 配置。
3. **「Prompt-driven, not deterministic script」**——读上下文 → 提建议 → 等确认。
4. **GLOSSARY.md + ADR**——domain-modeling 维护术语表和决策记录。

## 提炼的「写书方法论」（对标 D2L 落地）

### 1. Grounding（概念接地）—— 最重要，当前未显式做

> 每个概念必须先「接地」（读者要么走进来就知道，要么前面某段介绍过），后面的段落才能用它。

这正是 D2L「由浅入深」的精确表达。落地：建一张**概念接地表**，每个术语标注「在哪章首次接地、被哪些后续章节依赖、前置要求是什么」。目前本书跨章概念依赖靠「默契」，没靠「表」。

### 2. Zone of Proximal Development（最近发展区）

每章挑战「刚刚好」。落地：每章的「从零实现」精确地比前一章多一个能力，不跳级。

### 3. Fluency vs Storage Strength（练习的回忆性）

流畅感是假象，长期记忆靠 retrieval practice（回忆）、spacing（间隔）、interleaving（交叉）。**当前选择题是「识别」不是「回忆」**。落地：练习要更多「空白回忆」型（默写核心循环、补全缺失步骤），少「识别」型（选择题）。

### 4. Progressive disclosure（渐进披露）

正文精简，细节推到附录/延伸。落地：「延伸阅读」占位是渐进披露的落点，不是随便放链接。

### 5. 单一真相来源 + Pruning（修剪）

一个知识点只在一处讲；每句话做 no-op 测试（删掉它读者损失什么？）。落地：术语表一词一义 + 逐句修剪。

### 6. opinionated 写作规范（Matt Pocock 哲学）

把「七段式 + Grounding + 术语表」固化成一个**写作规范**（固定不变、有主见），内容（每章 markdown）是数据。对应 Matt 的「配置与机制分离」。

## 关键结论

- 业界**没有**现成的「D2L 式技术书」skill，但有完整方法论零件（上面 6 条），可组装成自己的写作规范。
- 瓶颈不在结构（结构已对齐 D2L），在三个未固化的东西：**Grounding（概念接地表）、Storage Strength（练习回忆性）、opinionated 写作规范**。
- 核心是「配置与机制分离」：写作规范固定，章节内容是数据。

## 行动项（下一步，按优先级）

1. **建「概念接地表」**（`openspec/specs/glossary/grounding.md`）——列全书核心概念：接地章节、依赖章节、前置要求。这是跨章一致性的地基。
2. **重做练习设计**——选择题降级为自测，新增「空白回忆」型练习。
3. **沉淀「写作规范」**——把 6 条方法论固化成一个 skill / 文档，每章强制走。

## 相关文件

- 术语表：`content/glossary.md`
- 章节结构（定稿标准）：见 `content/loop/page.mdx`（核心循环章是样板）
- OpenSpec 规格：`openspec/project.md`、`openspec/AGENTS.md`
