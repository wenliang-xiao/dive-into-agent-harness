## 1. 书站骨架

- [x] 1.1 初始化 Next.js App Router + TypeScript 项目（`npm create next-app`）
- [x] 1.2 接入 MDX 渲染（章节页 `/chapter/<slug>`）
- [x] 1.3 全局章节导航 + 上下章导航 + 深/浅主题切换
- [x] 1.4 编辑器式视觉语言（html-beautify token，浅色优先 + 暗色）
- [x] 1.5 archify 图 iframe 承载组件（`DiagramFrame` + `/diagram/[...path]` 路由）

## 2. 数据层

- [x] 2.1 接入 Drizzle ORM + SQLite（`src/lib/store`）
- [x] 2.2 定义 `store` 接口：进度 / 错题本 / 连续打卡
- [x] 2.3 刷题 API Routes（提交答案 / 查询进度 / 错题本）

## 3. 内容体系

- [x] 3.1 建立 `content/` 八章目录骨架（intro/loop/tools/context/sandbox/multiagent/eval/frontier）
- [x] 3.2 章节清单（`content/manifest.ts`）+ 七段式模板 + 引言章内容
- [x] 3.3 初始化术语表 `content/glossary.md`（harness/agent/loop/tool/context 等）

## 4. 图解管线

- [x] 4.1 用 archify 产出第一张机制图（agent 核心循环 lifecycle）作为范例
- [x] 4.2 用 eli5 产出引言章「什么是 agent harness」直觉图

## 5. 文档与发布

- [x] 5.1 根 README.md（项目简介 + 快速开始 + 贡献指南）
- [x] 5.2 LICENSE（MIT）
- [x] 5.3 校验 OpenSpec（`openspec validate`）并归档本 change
- [x] 5.4 初版 commit + push 到 GitHub
