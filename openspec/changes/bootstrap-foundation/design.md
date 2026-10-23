## Context

《动手学智能体框架》是「交互式书 + 刷题平台」。当前仓库只有 OpenSpec / trellis 骨架，尚无书站代码与内容体系。本变更落地 B 阶段技术栈（Next.js + MDX + Drizzle），并把内容生产约定固化。

## Goals / Non-Goals

**Goals:**
- 书站能渲染 MDX 章节，支持导航 / 目录 / 主题。
- 刷题数据走统一 `store` 接口，服务端持久化。
- 内容体系（七段式 + 分层表达）有明确目录约定与写作规范。
- 术语表 + 图解管线规范落地，保证跨会话产出一致。

**Non-Goals:**
- 不实现完整账号体系 / 排行榜 / 社区（属 C 阶段）。
- 不写完所有章节（本变更只定型体系 + 搭建骨架，章节随后续 change 增量产出）。
- 不引入独立后端服务（B 阶段用 Next.js API Routes）。

## Decisions

1. **书站**：Next.js App Router + MDX（`content-collections` 或 `next-mdx-remote` 按需定）。章节源文件放 `content/`，一章节一目录。
2. **数据层**：Drizzle ORM 抽象，默认 SQLite（`lib/store`），部署切 PostgreSQL。进度/错题本/连续打卡统一走 `store` 接口，UI 不感知存储实现。
3. **章节七段式**：每章固定 ①动机 ②直觉层 ③机制层 ④源码层 ⑤小结 ⑥练习 ⑦延伸阅读，元信息用 frontmatter（标题 / 章节序 / 主案例 / 对照 / 侧重 A|B|C）。
4. **图解管线**：机制图 → archify（输出到 `diagrams/<chapter>/`）；零代码直觉图 → eli5；代码形状 → show-me（内联）。
5. **术语表**：`specs/glossary/spec.md` 维护，一词一义；新增术语必须先查后写，禁止同义异名。
6. **视觉语言**：整站复用 html-beautify 的编辑部式 token（浅色优先 + 暗色），章节页与图解统一。

## Risks / Trade-offs

- **MDX 与交互组件的复杂度**：书站要嵌入 archify 独立 HTML 图，需约定 iframe 或组件化方式（archify 产物为独立 HTML，建议 iframe 承载）。
- **内容规模增长后的构建性能**：章节多时 MDX 编译可能变慢，预留按章节静态生成 + ISR。
- **cc 素材版权**：source map 还原内容仅教学引用，不整段复制原代码。

## 目录约定（骨架）

```text
content/
  intro/                    # 引言
  loop/                     # 核心循环
  tools/                    # 工具调用
  context/                  # 上下文与记忆
  sandbox/                  # 沙箱与安全
  multiagent/               # 多 agent 编排
  eval/                     # 评测与可观测
  frontier/                 # 前沿与生产
src/
  app/                      # Next.js 路由
  components/               # 交互组件（习题/进度/目录）
lib/
  store/                    # 刷题数据层（Drizzle + SQLite）
  quiz/                     # 刷题逻辑（多邻国式 + 粉笔式）
diagrams/                   # archify 产物（可探索 HTML）
openspec/
  specs/glossary/           # 术语表
  changes/                  # 变更提案
```
