# content-system Delta Spec

## MODIFIED Requirements

### Requirement: 章节七段式结构
每章 MUST 按固定七段式组织：①动机 → ②直觉层 → ③机制层 → ④源码层 → ⑤小结 → ⑥练习/动手实验 → ⑦延伸阅读。第 ⑥ 段为**动手实验与自测**（`CodeRunner` 在线改参数跑核心循环 + 可自测 check 清单），**不含 quiz 答题考核**。

#### Scenario: 产出新章节
- **WHEN** 任何模型/会话编写新章节
- **THEN** 章节 MDX 必须包含七段式全部段落，缺段不得定稿

#### Scenario: 章节元信息
- **WHEN** 章节落盘
- **THEN** frontmatter 必须含标题、章节序、主案例、对照案例、侧重（A|B|C）

#### Scenario: 无答题组件
- **WHEN** 章节第 ⑥ 段落地
- **THEN** 不引用 `Quiz` 组件、不依赖答题/错题/进度数据
