# quiz-engine Specification

## Purpose
TBD - created by archiving change bootstrap-foundation. Update Purpose after archive.
## Requirements
### Requirement: 统一 store 接口
进度 / 错题本 / 连续打卡 MUST 统一走 `store` 接口，UI 不感知存储实现（B 阶段 SQLite，C 阶段可切云端）。

#### Scenario: 存储可替换
- **WHEN** 从 SQLite 切换到 PostgreSQL 或云端 API
- **THEN** UI 与刷题逻辑无需改动

### Requirement: 多邻国式即时反馈
知识点后 MUST 紧跟随堂练习，答完立即反馈，支持连击与间隔重复。

#### Scenario: 随堂练习
- **WHEN** 读者完成一个知识点的练习
- **THEN** 立即显示对错与解析，连续答对计入连击

### Requirement: 粉笔式题库
章节结束 MUST 有章节测验，全局 MUST 有错题本与解析，支持按章节回顾。

#### Scenario: 错题本
- **WHEN** 读者答错题目
- **THEN** 题目自动进入错题本，可回顾、重做、查看解析

#### Scenario: 连续打卡
- **WHEN** 读者当日完成练习
- **THEN** 记录打卡，跨天连续计数

### Requirement: 服务端持久化
刷题数据 MUST 服务端持久化，支持多设备同步与排行榜。

#### Scenario: 多设备
- **WHEN** 读者换设备登录
- **THEN** 进度 / 错题本 / 打卡一致

