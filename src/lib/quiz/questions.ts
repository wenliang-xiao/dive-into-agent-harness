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

export const questions: ChapterQuestions[] = [
  { chapterSlug: "intro", questions: introQuestions },
];

export function getQuestions(slug: string): Question[] {
  return questions.find((q) => q.chapterSlug === slug)?.questions ?? [];
}
