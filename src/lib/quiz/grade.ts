import type { ChoiceQuestion, FillQuestion, OrderQuestion } from "./types";

/** 选择题判分：选中集合与正确集合一致（顺序无关） */
export function gradeChoice(q: ChoiceQuestion, selected: number[]): boolean {
  const a = [...q.answer].sort((x, y) => x - y);
  const s = [...selected].sort((x, y) => x - y);
  return a.length === s.length && a.every((v, i) => v === s[i]);
}

/** 填空题判分：逐空比对，忽略首尾空格与大小写 */
export function gradeFill(q: FillQuestion, answers: string[]): boolean {
  if (answers.length !== q.blanks.length) return false;
  return q.blanks.every(
    (blank, i) =>
      blank.trim().toLowerCase() === (answers[i] ?? "").trim().toLowerCase(),
  );
}

/** 排序题判分：顺序必须完全一致 */
export function gradeOrder(q: OrderQuestion, order: number[]): boolean {
  return (
    q.answer.length === order.length && q.answer.every((v, i) => v === order[i])
  );
}
