## Why

项目刚起步，grill 共识已达成但尚未落成可执行的结构。需要一个变更把「书站骨架 + 内容体系 + 刷题数据模型 + 术语表」定型，让后续任何模型 / 用户 / 会话都能按统一规范产出章节。

## What Changes

1. 搭建书站框架（Next.js App Router + MDX），支持章节导航 / 目录 / 深色主题。
2. 定义内容体系：章节七段式结构、分层表达（直觉/机制/源码）、章节源文件目录约定。
3. 定义刷题数据模型与 `store` 接口：进度 / 错题本 / 连续打卡，服务端持久化（SQLite，Drizzle ORM 抽象）。
4. 建立术语表（glossary）与图解管线规范（archify / eli5 / show-me 分工）。

## Capabilities

### New Capabilities
- `book-shell`: 书站框架——MDX 渲染、章节导航、目录、主题切换、响应式。
- `content-system`: 内容体系——章节七段式结构、分层表达约定、源文件目录规范。
- `quiz-engine`: 刷题引擎——多邻国式即时反馈 + 粉笔式题库/错题本/解析，统一 `store` 接口。
- `glossary`: 术语表——全书一词一义，domain-modeling 维护。
- `diagram-pipeline`: 图解管线——archify（机制图）/ eli5（直觉图）/ show-me（代码形状）的产出规范。

## Impact

- 新增依赖：Next.js、MDX、Drizzle ORM、SQLite driver、Tailwind（待 design 定）。
- 新增目录：`content/`（章节）、`src/`（前端）、`lib/store`（数据层）、`diagrams/`（图解产物）。
- 不改变 OpenSpec / trellis 工作流本身。
