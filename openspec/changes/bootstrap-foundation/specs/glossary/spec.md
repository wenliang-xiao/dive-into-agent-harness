## ADDED Requirements

### Requirement: 一词一义
全书术语 MUST 统一，同一概念只用一个词，禁止同义异名（如 harness / agent framework / agent scaffold 需明确取舍）。

#### Scenario: 新增术语
- **WHEN** 章节引入新术语
- **THEN** 先查术语表；已存在则沿用，不存在则登记并给出唯一定义

#### Scenario: 术语冲突
- **WHEN** 两个概念用了同一词
- **THEN** 立即在术语表消歧，确定其一并全文统一

### Requirement: 术语表维护
术语表 MUST 由 domain-modeling 维护，存于 `specs/glossary/`，随章节增量更新。

#### Scenario: 跨会话一致
- **WHEN** 新会话接手章节写作
- **THEN** 先读术语表再动笔，避免术语漂移
