# AI 开发守则（AGENTS.md）

> 任何 AI 模型或开发者在动手前，**必须先读本文件**与 [project.md](./project.md)。
> 它约束「怎么改、改完做什么」，保证**不同模型、不同用户、不同会话都能无缝接手开发**。

## 1. 先读规格，再写代码

- 动手前读 [project.md](./project.md)（单一事实来源）。
- 涉及内容体系，必读本目录 `specs/` 与当前 `changes/`。
- 涉及技术选型变更，新增 ADR 到 `decisions/`。

## 2. 所有内容文档化存储（硬性）

**这是本项目的生命线。** 一切内容、设计、决策必须落成 markdown，保证任何模型 / 用户 / 会话都能从中接手：

1. 需求变更 → 写 `changes/<name>/proposal.md` + 更新 `specs/`。
2. 架构 / 技术选型 → `changes/<name>/design.md` + ADR 到 `decisions/`。
3. 章节内容 → 遵循「章节生产规范」（见下），产出 MDX + 配图，落地到 `content/`。
4. 术语 → 统一到 `specs/glossary`，一词一义，新增术语先查再写。
5. 每完成一次变更，**同一 commit 内**同步更新受影响的规格文档。

> 原则：**文档与代码同版本演进**。宁可文档先行，不可代码先行。

## 3. 章节生产规范（对标 D2L）

每章严格按 project.md 的七段式结构（①动机 → ②直觉层 → ③机制层 → ④源码层 → ⑤小结 → ⑥练习 → ⑦延伸阅读），并遵守：

- **细节程度对标 D2L**：每个结论追到源码 / 可信来源，不写「可能是这样」。
- **图必配**：机制类内容优先用 archify 产出可探索 HTML 图；零代码直觉用 eli5。
- **术语统一**：全书一词一义（见 domain-modeling 与术语表）。
- **分层表达**：每个概念覆盖直觉层 / 机制层 / 源码层，服务全人群读者。
- 素材严格基于真实主流 harness 源码；cc 相关内容必须标注「基于 source map 还原，非官方源码」。

## 4. skill 复用（不要重复造轮子）

- 画图：archify（机制图）、show-me（代码形状）、svg-diagram-design（SVG 修复）。
- 排版：html-beautify（编辑部式视觉语言）。
- 写作：techdoc（理解路径 / 去冗余 / 中文用词）。
- 术语：domain-modeling。
- 章节生产 skill 的编写遵循 superpowers 的 `writing-skills`（skill = TDD，无失败测试不写 skill）。

## 5. 红线

- **凭据一律环境变量**，禁止硬编码；`.env` 已 gitignore。
- **cc 的源码还原内容**仅用于教学分析，标注来源，不复制受版权保护的原始代码。
- 本地工具目录 `.trellis/`、`.pi/`、`.claude/`、`.opencode/`、`.codex/` **严禁提交**。

## 6. Git 规范

- commit message 用英文（GitHub 开源项目）。
- 与 `origin` 对比前先 `git fetch -p`。
- 提交前确认 `git status` 无本地工具目录与密钥。

## 7. 新功能开发流程

1. `openspec new change <name>` 建变更提案，写 proposal / design / tasks。
2. 评审通过后按 tasks 逐条实现（可 trellis `channel` 并行）。
3. 实现 + 自测（章节跑通渲染、刷题可用）。
4. 提交时带上规格文档更新，完成后 `openspec archive <name>`。
