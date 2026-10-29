# book-shell Delta Spec

## MODIFIED Requirements

### Requirement: 章节导航
MUST 提供全局章节导航，按 D2L 递进顺序排列。站点为纯学习网站，**不追踪进度**，导航栏只含「目录」「API 配置」「主题切换」。

#### Scenario: 顺序学习
- **WHEN** 读者在章节页
- **THEN** 可查看上一章/下一章与全书目录

#### Scenario: 无进度入口
- **WHEN** 读者打开任意页面
- **THEN** 导航栏不出现「进度」「错题本」等刷题入口
