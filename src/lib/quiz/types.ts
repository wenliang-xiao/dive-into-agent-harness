export type ChoiceQuestion = {
  id: string;
  type: "single" | "multiple";
  prompt: string;
  options: string[];
  /** 正确选项索引 */
  answer: number[];
  /** 解析 */
  explain: string;
};

export type FillQuestion = {
  id: string;
  type: "fill";
  prompt: string;
  /** 代码骨架，挖空处用 ___ 占位 */
  template: string;
  /** 每个空的正确答案（按 ___ 出现顺序） */
  blanks: string[];
  /** 解析 */
  explain: string;
};

export type OrderQuestion = {
  id: string;
  type: "order";
  prompt: string;
  /** 打乱顺序的步骤 */
  items: string[];
  /** 正确顺序（items 索引） */
  answer: number[];
  /** 解析 */
  explain: string;
};

export type Question = ChoiceQuestion | FillQuestion | OrderQuestion;

export type ChapterQuestions = {
  chapterSlug: string;
  questions: Question[];
};
