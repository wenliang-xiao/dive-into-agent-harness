## ADDED Requirements

### Requirement: 图解分工
图解 MUST 按内容特性选型：机制图 → archify；零代码直觉图 → eli5；代码形状 → show-me（内联）。

#### Scenario: 机制图解
- **WHEN** 章节需展示 agent 机制（如工具调用循环、多 agent 时序、消息生命周期）
- **THEN** 用 archify 产出可探索 HTML 图，落入 `diagrams/<chapter>/`

#### Scenario: 零代码直觉
- **WHEN** 章节需向零代码读者解释概念
- **THEN** 用 eli5 大图少字，配合直觉层文字

### Requirement: 图可复现
图解产物与生成方式 MUST 可复现，便于跨会话修复。

#### Scenario: 修复图
- **WHEN** 图需调整
- **THEN** archify 保留 candidate.json + 产物 HTML 于 `.archify/` 对应目录，可重跑 finalize 修复

### Requirement: 视觉一致
全书图解与页面 MUST 统一采用 html-beautify 编辑部式视觉语言，深/浅主题自适应。

#### Scenario: 主题跟随
- **WHEN** 读者切换深/浅主题
- **THEN** 图解与章节页配色一致
