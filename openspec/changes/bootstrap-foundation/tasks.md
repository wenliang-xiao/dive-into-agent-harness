## 1. 书站骨架

- [ ] 1.1 初始化 Next.js App Router + TypeScript 项目（`npm create next-app`）
- [ ] 1.2 接入 MDX 渲染（章节页 `/chapter/<slug>`）
- [ ] 1.3 全局章节导航 + TOC + 深/浅主题切换
- [ ] 1.4 编辑器式视觉语言（html-beautify token，浅色优先 + 暗色）
- [ ] 1.5 archify 图 iframe 承载组件

## 2. 数据层

- [ ] 2.1 接入 Drizzle ORM + SQLite（`lib/store`）
- [ ] 2.2 定义 `store` 接口：进度 / 错题本 / 连续打卡
- [ ] 2.3 刷题 API Routes（提交答案 / 查询进度 / 错题本）

## 3. 内容体系

- [ ] 3.1 建立 `content/` 八章目录骨架（intro/loop/tools/context/sandbox/multiagent/eval/frontier）
- [ ] 3.2 章节 frontmatter schema + 七段式模板
- [ ] 3.3 初始化术语表 `specs/glossary/`（首批核心术语：harness/agent/loop/tool/context 等）

## 4. 图解管线

- [ ] 4.1 用 archify 产出第一张机制图（agent 核心循环 workflow）作为范例
- [ ] 4.2 用 eli5 产出引言章「什么是 agent harness」直觉图

## 5. 文档与发布

- [ ] 5.1 根 README.md（项目简介 + 快速开始 + 贡献指南）
- [ ] 5.2 LICENSE（MIT）
- [ ] 5.3 校验 OpenSpec（`openspec validate`）并归档本 change
- [ ] 5.4 初版 commit + push 到 GitHub
