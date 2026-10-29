## 1. 移除刷题数据层与 API

- [x] 1.1 删除 `src/lib/store/`（schema.ts + index.ts）
- [x] 1.2 删除 `src/lib/quiz/`（types / grade / grade.test / questions）
- [x] 1.3 删除刷题 API：`answer` / `progress` / `complete` / `mistakes` 四个 route
- [x] 1.4 从 `package.json` 移除 `better-sqlite3`、`drizzle-orm`、`drizzle-kit`、`@libsql/client`、`@types/better-sqlite3`

## 2. 移除刷题前端与页面

- [x] 2.1 删除 `src/components/quiz.tsx`、`src/components/chapter-actions.tsx`
- [x] 2.2 删除 `src/app/progress/page.tsx`、`src/app/mistakes/page.tsx`
- [x] 2.3 `layout.tsx` 移除「进度」「错题本」导航 + 元信息去「刷题平台」
- [x] 2.4 首页 `page.tsx` 文案去「刷题平台」「边学边练」
- [x] 2.5 `chapter/[slug]/page.tsx` 移除 `ChapterActions` 引用

## 3. 清理章节 MDX

- [x] 3.1 9 章各移除 `Quiz` / `getQuestions` import、`export const questions`、`<Quiz />`

## 4. 文档同步

- [x] 4.1 `project.md` 更新定位 / 技术栈 / 章节结构 / Roadmap（去刷题）
- [x] 4.2 `DEPLOY.md` 去 Turso，改为纯静态 + 薄代理说明
- [x] 4.3 `README.md` 同步
- [x] 4.4 `decisions/0001-turso-managed-sqlite.md` 标记 superseded

## 5. 验证

- [x] 5.1 `npm run build` 通过（无 quiz/store/数据库引用残留）
- [x] 5.2 本地 `npm run dev` + 填 MiFy key，`/api/run` 流式跑通
- [x] 5.3 `git status` 无敏感文件（.env / data / key 明文）
- [x] 5.4 `openspec validate remove-quiz-static-site` 通过
