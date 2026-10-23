## ADDED Requirements

### Requirement: 章节七段式结构
每章 MUST 按固定七段式组织：①动机 → ②直觉层 → ③机制层 → ④源码层 → ⑤小结 → ⑥练习 → ⑦延伸阅读。

#### Scenario: 产出新章节
- **WHEN** 任何模型/会话编写新章节
- **THEN** 章节 MDX 必须包含七段式全部段落，缺段不得定稿

#### Scenario: 章节元信息
- **WHEN** 章节落盘
- **THEN** frontmatter 必须含标题、章节序、主案例、对照案例、侧重（A|B|C）

### Requirement: 分层表达
每个核心概念 MUST 覆盖直觉层（无代码，图示+类比）、机制层（核心代码/代码形状）、源码层（真实 harness 精读）三层。

#### Scenario: 零代码读者可读
- **WHEN** 读者只看直觉层
- **THEN** 仍能理解概念「是什么、为什么」，无需阅读代码

#### Scenario: 源码层有据
- **WHEN** 章节引用真实 harness 源码
- **THEN** 每个结论必须落到 `仓库:文件`（或 source map 还原出处），cc 相关内容标注「基于 source map 还原，非官方源码」

### Requirement: 素材约束
内容 MUST 严格基于真实主流 harness 源码（opencode / codex / cc / pi / deepseek-harness / durable-harness / openclaw / hermes / qwen-audio-agent / xiaoaiclaw / corojaw），不虚构机制。

#### Scenario: 引用素材
- **WHEN** 章节讲某机制
- **THEN** 至少一个主案例项目 + 可选对照项目，且标注各自来源

### Requirement: 写作规范
章节写作 MUST 遵循 techdoc 规范（理解路径、去冗余、中文用词），细节程度对标 D2L。

#### Scenario: 结论有据
- **WHEN** 章节出现结论
- **THEN** 每个结论有源码/数据/可信来源支撑，不写「可能是这样」
