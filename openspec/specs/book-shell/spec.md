# book-shell Specification

## Purpose
TBD - created by archiving change bootstrap-foundation. Update Purpose after archive.
## Requirements
### Requirement: MDX 章节渲染
书站 MUST 能渲染 `content/` 下的 MDX 章节，支持标题层级、代码块、表格与交互组件。

#### Scenario: 章节访问
- **WHEN** 读者访问 `/chapter/<slug>`
- **THEN** 渲染对应章节七段式内容，目录（TOC）可跳转

### Requirement: 章节导航
MUST 提供全局章节导航，按 D2L 递进顺序排列，标注当前进度。

#### Scenario: 顺序学习
- **WHEN** 读者在章节页
- **THEN** 可查看上一章/下一章与全书目录

### Requirement: 主题与响应式
MUST 支持深色/浅色主题，桌面与移动端均无溢出、可读。

#### Scenario: 移动端阅读
- **WHEN** 读者在手机打开章节
- **THEN** 无水平滚动，代码块与图解自适应

### Requirement: 图解承载
章节 MUST 可嵌入 archify 产出的独立 HTML 图（可探索、可导出）。

#### Scenario: 嵌入机制图
- **WHEN** 章节引用 archify 图
- **THEN** 图以 iframe 承载，深/浅主题跟随，不影响章节页交互

