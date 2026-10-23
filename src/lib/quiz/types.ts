export type Question = {
  id: string;
  type: "single" | "multiple";
  prompt: string;
  options: string[];
  /** 正确选项索引 */
  answer: number[];
  /** 解析 */
  explain: string;
};

export type ChapterQuestions = {
  chapterSlug: string;
  questions: Question[];
};
