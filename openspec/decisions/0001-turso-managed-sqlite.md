# ADR-0001：部署数据库选型 —— Turso 托管 SQLite（替代 PostgreSQL）

- 状态：已采纳
- 日期：2026-10-23

## 背景

`bootstrap-foundation` 的 design.md 约定「部署切 PostgreSQL（Supabase/Neon）」。实际实现部署准备时发现：本地开发用 better-sqlite3（`sqliteTable` schema），切 PostgreSQL 需要把整套 drizzle schema 从 `sqliteTable` 重写为 `pgTable`，维护两套方言 schema，成本高且易漂移。

## 决策

部署数据库改用 **Turso（托管 SQLite，libsql 协议）**，与本地 better-sqlite3 共用同一套 `sqliteTable` schema。

| 环境 | 驱动 | schema |
|------|------|--------|
| 本地开发 | better-sqlite3（文件 `data/d2a.db`） | `sqliteTable` |
| 部署 | `@libsql/client`（Turso，`DATABASE_URL=libsql://...`） | `sqliteTable`（同一套） |

## 理由

1. **schema 单套**：SQLite 方言统一，无需维护两套 schema，避免漂移。
2. **部署零改造**：`store` 接口不变，UI/刷题逻辑不感知存储实现（本就满足 design.md 的「统一 store 接口」约定）。
3. **成本与规模适配**：本书刷题数据是个人级写读，Turso 免费额度足够；C 阶段需要更强并发时再评估 PostgreSQL。

## 后果

- design.md 技术栈表的「PostgreSQL（Supabase/Neon）」条目废止，以本 ADR 为准。
- 若 C 阶段引入账号体系 + 高并发排行榜，需重新评估 PostgreSQL 并新增 ADR。
