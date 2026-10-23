export type Chapter = {
  slug: string;
  title: string;
  order: number;
  mainCase: string;
  compare: string[];
  /** 动手侧重：A 演示代码 / B 源码精读 / C 实验 */
  focus: "A" | "B" | "C";
  summary: string;
};

/** 全书章节清单（对标 D2L 递进式结构） */
export const chapters: Chapter[] = [
  {
    slug: "intro",
    title: "引言：什么是 agent harness",
    order: 0,
    mainCase: "—",
    compare: [],
    focus: "A",
    summary: "为什么 harness 决定 LLM 使用效率（个人开发 + 云端 agent 双视角）",
  },
  {
    slug: "loop",
    title: "核心循环",
    order: 1,
    mainCase: "opencode",
    compare: ["pi"],
    focus: "A",
    summary: "一个 LLM + 一个消息循环 = 最简 agent",
  },
  {
    slug: "tools",
    title: "工具调用",
    order: 2,
    mainCase: "codex",
    compare: ["opencode"],
    focus: "A",
    summary: "function calling / 工具定义 / 执行 / 结果回传",
  },
  {
    slug: "context",
    title: "上下文与记忆",
    order: 3,
    mainCase: "cc",
    compare: ["opencode"],
    focus: "B",
    summary: "上下文窗口 / compaction / 检索 / 文件系统",
  },
  {
    slug: "sandbox",
    title: "沙箱与安全",
    order: 4,
    mainCase: "codex",
    compare: ["pi"],
    focus: "B",
    summary: "命令隔离 / 权限 / 审批流",
  },
  {
    slug: "multiagent",
    title: "多 agent 编排",
    order: 5,
    mainCase: "opencode",
    compare: ["cc Task"],
    focus: "C",
    summary: "subagent / 任务分解 / 并行",
  },
  {
    slug: "eval",
    title: "评测与可观测",
    order: 6,
    mainCase: "deepseek-harness",
    compare: ["corojaw"],
    focus: "C",
    summary: "benchmark / trace / telemetry / 成本",
  },
  {
    slug: "frontier",
    title: "前沿与生产",
    order: 7,
    mainCase: "xiaoaiclaw / coro",
    compare: ["全景横评"],
    focus: "C",
    summary: "多模态 / MCP 生态 / 云端生产化",
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getAdjacent(slug: string): {
  prev: Chapter | undefined;
  next: Chapter | undefined;
} {
  const i = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : undefined,
  };
}
