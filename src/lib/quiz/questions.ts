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
];

export const questions: ChapterQuestions[] = [
  { chapterSlug: "intro", questions: introQuestions },
  { chapterSlug: "loop", questions: loopQuestions },
  { chapterSlug: "tools", questions: toolsQuestions },
];

export function getQuestions(slug: string): Question[] {
  return questions.find((q) => q.chapterSlug === slug)?.questions ?? [];
}
