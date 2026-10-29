import type { ChapterQuestions, Question } from "./types";

const introQuestions: Question[] = [
  {
    id: "intro-1",
    type: "multiple",
    prompt: "harness 的核心循环包含哪几步？（可多选）",
    options: ["调用模型", "执行工具", "回填结果", "训练模型"],
    answer: [0, 1, 2],
    explain:
      "核心循环是「调用模型 → 执行工具 → 回填结果 → 判断结束」。训练模型不属于运行时 harness 的职责。",
  },
  {
    id: "intro-2",
    type: "single",
    prompt: "大模型本身能「自己动手干活」吗？",
    options: ["能，它可以直接改文件、跑命令", "不能，它只会生成文字，需要 harness 去执行"],
    answer: [1],
    explain:
      "大模型只会生成文字。改文件、跑命令这些动作，需要 harness 把模型输出的「工具调用」真正执行掉。",
  },
  {
    id: "intro-3",
    type: "single",
    prompt: "下面哪个是「工具调用」的例子？",
    options: [
      "模型输出一段文字建议",
      "模型要求改某个文件，harness 真正去改",
      "模型生成一个标题",
    ],
    answer: [1],
    explain:
      "工具调用 = 模型发出「要调用工具」的信号，harness 执行并回填结果。其余两个只是普通文本生成。",
  },
  {
    id: "intro-order-1",
    type: "order",
    prompt: "核心循环的四个步骤，正确的先后顺序是？",
    items: ["执行工具", "调用模型", "判断结束", "回填结果"],
    answer: [1, 0, 3, 2],
    explain:
      "核心循环四步：①调用模型 → ②执行工具 → ③回填结果 → ④判断结束。回填是关键：不把结果喂回，模型就卡死在同一步。",
  },
];

const loopQuestions: Question[] = [
  {
    id: "loop-1",
    type: "single",
    prompt: "核心循环的第一步是什么？",
    options: ["调用模型，让模型决定下一步", "直接执行工具", "把结果回填", "判断是否结束"],
    answer: [0],
    explain: "循环从「调用模型」开始——让模型决定该说什么、该调什么工具。后续步骤都依赖这一步的输出。",
  },
  {
    id: "loop-2",
    type: "multiple",
    prompt: "模型输出「工具调用」后，harness 需要做什么？（可多选）",
    options: ["执行这个工具", "把执行结果回填到对话", "直接把工具调用当最终答案返回", "再次调用模型让它看到结果"],
    answer: [0, 1, 3],
    explain: "工具调用不是终点：要执行工具、回填结果、再喂回模型。把工具调用直接当答案返回是错误的。",
  },
  {
    id: "loop-3",
    type: "single",
    prompt: "pi 的 agent-loop.ts 里，`hasMoreToolCalls` 变量用来做什么？",
    options: ["判断是否还有工具调用，决定循环继续还是结束", "记录调用了多少次模型", "缓存工具执行结果", "控制模型温度"],
    answer: [0],
    explain: "`hasMoreToolCalls = !executedToolBatch.terminate`——只要还有工具调用没处理完，内层循环就继续。",
  },
  {
    id: "loop-fill-1",
    type: "fill",
    prompt: "补全核心循环代码中挖空的两个关键标识符：",
    template:
      "for (let turn = 0; turn < maxTurns; turn++) {\n  const reply = await callLLM(messages);\n  messages.___(reply);\n  if (reply.___.length === 0) return messages;\n}",
    blanks: ["push", "tool_calls"],
    explain:
      "reply 要 push 回消息数组（回填结果）；tool_calls 为空表示模型不再调工具，循环结束。",
  },
];

const toolsQuestions: Question[] = [
  {
    id: "tools-1",
    type: "single",
    prompt: "模型怎么知道「有哪些工具可以用」？",
    options: [
      "调用模型时，把工具声明（名字+描述+参数 schema）一起传进去",
      "模型自己从互联网搜索",
      "harness 把工具列表写进模型权重",
    ],
    answer: [0],
    explain: "工具以「声明」（JSON Schema：名字、描述、参数）形式随请求传给模型，模型据此决定调用哪个、传什么参数。",
  },
  {
    id: "tools-2",
    type: "multiple",
    prompt: "模型返回的「工具调用」（tool_call）里包含什么？（可多选）",
    options: ["工具名", "参数（JSON）", "调用 id", "工具的实现代码"],
    answer: [0, 1, 2],
    explain: "tool_call 只有名字、参数和 id——它是「我想调这个工具、传这些参数」的意图，不含实现。实现由 harness 负责。",
  },
  {
    id: "tools-3",
    type: "single",
    prompt: "工具执行完，结果怎么回传给模型？",
    options: [
      "作为一条 tool 角色消息，用 tool_call_id 关联回那次调用",
      "作为新的 user 消息",
      "直接拼进系统提示词",
    ],
    answer: [0],
    explain: "结果是 tool 角色消息，带 tool_call_id 与原始调用对应，这样模型能知道「这个结果对应我哪次调用」。",
  },
  {
    id: "tools-order-1",
    type: "order",
    prompt: "工具调用的处理链路，正确的先后顺序是？",
    items: ["执行并封装结果", "声明 JSON Schema", "校验参数", "解析参数"],
    answer: [1, 3, 2, 0],
    explain:
      "链路：声明(Schema) → 解析参数 → 校验 → 执行+封装。声明在前（模型要知道有工具），封装在后（错误回传不崩）。",
  },
];

const contextQuestions: Question[] = [
  {
    id: "context-1",
    type: "single",
    prompt: "「Context Rot（上下文腐烂）」指什么？",
    options: [
      "上下文窗口里的 token 越多，模型准确回忆信息的能力越下降",
      "上下文里的文件被病毒破坏",
      "模型输出的代码质量随时间下降",
    ],
    answer: [0],
    explain: "Context Rot 是 Anthropic 提出的核心概念：窗口塞得越满，模型越难准确提取其中的关键信息。",
  },
  {
    id: "context-2",
    type: "single",
    prompt: "Claude Code 的压缩是分档的，从轻到重依次是？",
    options: [
      "Snip（截断）→ Microcompact（瘦身）→ Context Collapse（折叠）→ Auto Compact（摘要）",
      "直接删除所有历史消息",
      "Auto Compact → Microcompact → Snip",
    ],
    answer: [0],
    explain: "cc 用多档预警状态机：先截断超长历史，再瘦身工具结果，再折叠重复内容，最后才 fork 子 agent 做摘要。",
  },
  {
    id: "context-3",
    type: "multiple",
    prompt: "Claude Code 的四层记忆架构包含哪几类？（可多选）",
    options: ["user（用户画像）", "feedback（行为指导）", "project（项目动态）", "reference（外部指针）", "code（代码片段）"],
    answer: [0, 1, 2, 3],
    explain: "四类是 user/feedback/project/reference。注意：代码模式、git 历史、调试方案这类「能从项目状态推导出的信息」明确不保存。",
  },
  {
    id: "context-fill-1",
    type: "fill",
    prompt: "补全「压缩」的本质（填两个关键词）：",
    template: "压缩 = 用「___」替换原文，保留 ___、丢弃细节，用信息密度换空间。",
    blanks: ["摘要", "信息"],
    explain:
      "压缩是「摘要替换原文」：保留信息（关键结论）、丢弃细节（中间过程）。这区别于「删除」——删除丢信息，压缩保关键。",
  },
];

const sandboxQuestions: Question[] = [
  {
    id: "sandbox-1",
    type: "single",
    prompt: "pi 的 `beforeToolCall` 钩子在什么时候触发？",
    options: ["工具执行之前，用来做权限检查", "工具执行之后", "只在报错时触发"],
    answer: [0],
    explain: "beforeToolCall 在工具真正执行前调用，返回 block 就能拦下这次调用——这是审批流/权限检查的落点。",
  },
  {
    id: "sandbox-2",
    type: "single",
    prompt: "一个工具调用被 block 后，会发生什么？",
    options: [
      "不执行，返回一条错误结果回传给模型",
      "整个 agent 崩溃退出",
      "跳过这个工具继续执行下一个",
    ],
    answer: [0],
    explain: "block 不是崩溃，而是把「被拦了」作为错误结果回传，模型看到后可以调整策略（比如换一种不危险的做法）。",
  },
  {
    id: "sandbox-3",
    type: "multiple",
    prompt: "为什么 agent 需要沙箱/权限约束？（可多选）",
    options: ["它执行的命令可能有破坏性（如 rm -rf）", "它可能误删文件", "模型输出不可信，可能被 prompt injection 劫持", "它跑得不够快"],
    answer: [0, 1, 2],
    explain: "agent 的强大来自「能执行」，但这也意味着破坏力。加上模型输出不可信、可能被注入劫持，必须用沙箱/权限兜底。",
  },
  {
    id: "sandbox-order-1",
    type: "order",
    prompt: "执行一个工具调用前，正确的处理顺序是？",
    items: ["真正执行工具", "解析参数", "权限检查（beforeToolCall）", "校验参数"],
    answer: [1, 3, 2, 0],
    explain:
      "执行前顺序：解析参数 → 校验参数 → 权限检查 → 真正执行。权限闸门设在「执行之前、校验之后」。",
  },
];

const multiagentQuestions: Question[] = [
  {
    id: "multiagent-1",
    type: "single",
    prompt: "Claude Code 的 Coordinator Mode 里，协调者用哪个工具派发新 worker？",
    options: ["AgentTool", "Bash", "FileEdit", "Grep"],
    answer: [0],
    explain: "协调者的工具集是管理类：AgentTool（派发 worker）、SendMessageTool（发指令）、TaskStopTool（停掉 worker）。",
  },
  {
    id: "multiagent-2",
    type: "single",
    prompt: "「Prompt 即编排」是什么意思？",
    options: [
      "多 agent 的编排逻辑写在 system prompt 指令里，而不是代码 DAG",
      "用 prompt 生成代码",
      "把 prompt 存到数据库",
    ],
    answer: [0],
    explain: "cc 的协调者靠 prompt 里的指令（如「不要串行化可并行的任务」）来调度 worker，而非确定性的代码逻辑。",
  },
  {
    id: "multiagent-3",
    type: "single",
    prompt: "为什么 subagent / worker 用「独立 loop、完全隔离的上下文」？",
    options: [
      "避免子任务的细节污染主上下文，各自独立、不互相干扰",
      "为了多收 API 费用",
      "因为模型不支持长上下文",
    ],
    answer: [0],
    explain: "隔离上下文 = 子 agent 的探索、试错、中间过程都在自己的窗口里，主 agent 只拿到结论，避免 Context Rot。",
  },
  {
    id: "multiagent-fill-1",
    type: "fill",
    prompt: "补全多 agent 的核心价值（填两个关键词）：",
    template: "worker 有独立的「___」；dispatchWorker 返回 worker 的 ___，不是全过程。",
    blanks: ["消息数组", "最终输出"],
    explain:
      "worker 有独立的消息数组（独立状态），主 agent 只拿 worker 的最终结论——探索、试错都留在子窗口里。",
  },
];

const evalQuestions: Question[] = [
  {
    id: "eval-1",
    type: "single",
    prompt: "harness 评测（benchmark）主要测什么？",
    options: [
      "harness 本身的性能/稳定性（循环、会话、IO 快不快、稳不稳）",
      "大模型聪不聪明",
      "代码写得好不好看",
    ],
    answer: [0],
    explain: "harness 是基础设施，评测测它自己：会话列表、搜索、fork 等用户路径的耗时与内存。模型智商是另一回事。",
  },
  {
    id: "eval-2",
    type: "single",
    prompt: "deepseek-harness 的 benchmark 为什么用「合成输入」而不是真实 session？",
    options: ["确定性、可复现，且不用真实用户数据", "真实数据太贵", "合成数据更快"],
    answer: [0],
    explain: "合成输入由固定常量生成，每次跑都一样，能稳定对比性能；也不碰真实用户材料。",
  },
  {
    id: "eval-3",
    type: "single",
    prompt: "benchmark 里的「预算（budget）」指什么？",
    options: [
      "性能阈值，超预算就判定失败",
      "内存分配额度",
      "API 调用次数限制",
    ],
    answer: [0],
    explain: "预算 = 性能断言（如「首屏 list 中位数 < 200ms」），超了就失败。这是防止性能回退的门槛。",
  },
  {
    id: "eval-fill-1",
    type: "fill",
    prompt: "补全 benchmark 的三大原则（填两个关键词）：",
    template: "三大原则：按用户路径组织、___ 输入可复现、___ 断言防回退。",
    blanks: ["合成", "预算"],
    explain:
      "合成输入保证可复现（真实数据每天变），预算断言把性能门槛写死（超了就失败）。",
  },
];

const frontierQuestions: Question[] = [
  {
    id: "frontier-1",
    type: "single",
    prompt: "多模态语音 agent 的「Agent Presence」指什么？",
    options: [
      "对话保持流畅，agent 始终「在场」，不因查资料/思考而卡住",
      "agent 一直开着摄像头",
      "agent 的物理存在感",
    ],
    answer: [0],
    explain: "语音是实时对话，用户不能忍受「agent 卡住 10 秒查资料」。Agent Presence = 让对话流保持流动，agent 随时响应。",
  },
  {
    id: "frontier-2",
    type: "single",
    prompt: "openclaw 为什么拆成 Gateway / Channels / plugins 多个层次？",
    options: [
      "生产化：各职责独立开发、独立扩展、独立部署（个人/团队同一套）",
      "纯粹为了代码好看",
      "因为 TypeScript 强制要求",
    ],
    answer: [0],
    explain: "openclaw 把循环（Gateway）、渠道（Channels）、模型/工具（plugins）拆开，个人笔记本和团队部署只差配置——这正是生产化的意义。",
  },
  {
    id: "frontier-3",
    type: "single",
    prompt: "这本书讲的核心循环，在 openclaw 的生产化架构里对应哪个组件？",
    options: ["Gateway（控制平面）", "Channels（渠道）", "plugins（插件）"],
    answer: [0],
    explain: "核心循环（消息数组 + while 循环）在生产化后就是 openclaw 的 Gateway——核心没变，只是从单进程函数变成了独立控制平面。",
  },
  {
    id: "frontier-order-1",
    type: "order",
    prompt: "生产化把单进程循环拆成模块，按本书章节顺序排列：",
    items: ["context（上下文）", "loop（核心循环）", "tool（工具调用）", "sandbox（沙箱）"],
    answer: [1, 2, 0, 3],
    explain:
      "模块顺序对应章节：第 1 章 loop → 第 2 章 tool → 第 3 章 context → 第 4 章 sandbox。生产化只是拆开部署边界，循环逻辑不变。",
  },
];

const closureQuestions: Question[] = [
  {
    id: "closure-1",
    type: "single",
    prompt: "agent 跑一次留下的 trajectory，在 RL 训练里扮演什么角色？",
    options: [
      "可观测的马尔可夫链，是训练下一代 agent 模型的原料",
      "日志，只是为了调试方便",
      "成本账单，只用来算钱",
    ],
    answer: [0],
    explain: "trajectory = state→action→observation 的采样序列，正是 RL（GRPO/PPO）训练要的（状态，动作，奖励）数据。它是数据生产，不是副产品。",
  },
  {
    id: "closure-2",
    type: "single",
    prompt: "一条 trajectory 的 stopReason=endTurn 和 maxTokens 有什么区别？",
    options: [
      "endTurn 是模型答完，maxTokens 是轮数上限被截断",
      "完全一样，只是命名不同",
      "endTurn 表示出错，maxTokens 表示成功",
    ],
    answer: [0],
    explain: "endTurn=模型自己停了（完整轨迹）；maxTokens=轮数上限截断（半截轨迹）。被截断的轨迹行为不完整，训练时要单独处理——这正是 stopReason 字段存在的意义。",
  },
  {
    id: "closure-3",
    type: "multiple",
    prompt: "harness 为什么要把 trajectory 结构化地输出？（可多选）",
    options: ["可复现，评测时能「这次和上次比」", "可当训练数据，RL 要成对的状态-动作-奖励", "可跨 harness 对齐，放进同一个评测/训练集", "结构化后模型跑得更快"],
    answer: [0, 1, 2],
    explain: "结构化输出服务三个目标：可复现、可训练、可对齐。它不会让模型跑得更快——那是推理部署的事。",
  },
  {
    id: "closure-fill-1",
    type: "fill",
    prompt: "补全飞轮闭环的两个关键词：",
    template: "agent 跑 → 产生 ___ → RL 训练 → 更强模型 → 高效部署（PD 分离 / KV cache）→ 跑得更好。",
    blanks: ["trajectory"],
    explain: "trajectory 是闭环的原料：agent 跑出轨迹，轨迹喂给训练，训练出更强模型，更强模型配合高效部署跑得更好。",
  },
];

export const questions: ChapterQuestions[] = [
  { chapterSlug: "intro", questions: introQuestions },
  { chapterSlug: "loop", questions: loopQuestions },
  { chapterSlug: "tools", questions: toolsQuestions },
  { chapterSlug: "context", questions: contextQuestions },
  { chapterSlug: "sandbox", questions: sandboxQuestions },
  { chapterSlug: "multiagent", questions: multiagentQuestions },
  { chapterSlug: "eval", questions: evalQuestions },
  { chapterSlug: "frontier", questions: frontierQuestions },
  { chapterSlug: "closure", questions: closureQuestions },
];

export function getQuestions(slug: string): Question[] {
  return questions.find((q) => q.chapterSlug === slug)?.questions ?? [];
}
