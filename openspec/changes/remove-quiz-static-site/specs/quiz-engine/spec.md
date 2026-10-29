# quiz-engine Delta Spec（本 change 移除该能力）

## REMOVED Requirements

### Requirement: 统一 store 接口
**Reason**: 刷题闭环整体废弃，进度/错题本/打卡不再需要服务端持久化；数据库在 Vercel serverless 只读文件系统上无法运行。
**Migration**: 无替代。刷题能力另起新项目；本项目不做登录/账号/进度存储。

### Requirement: 多邻国式即时反馈
**Reason**: 随堂练习与连击/间隔重复属于刷题闭环，从学习网站移除。
**Migration**: 章节末尾的「动手实验」由 `CodeRunner`（在线改参数跑核心循环）承接，无答题反馈。

### Requirement: 粉笔式题库
**Reason**: 章节测验、错题本、解析、按章节回顾均为刷题平台功能，另起项目。
**Migration**: 删除 `quiz` 组件、`src/lib/quiz/`、`progress`/`mistakes` 页面与相关 API。

### Requirement: 服务端持久化
**Reason**: 无账号体系，无需多设备同步与排行榜；数据库依赖整体移除。
**Migration**: 删除 `src/lib/store/` 与 SQLite/Drizzle/Turso 依赖，站点变为纯静态 + 无状态薄代理。
