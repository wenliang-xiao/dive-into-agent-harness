import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeChoice, gradeFill, gradeOrder } from "./grade";
import type { ChoiceQuestion, FillQuestion, OrderQuestion } from "./types";

test("gradeChoice: 单选命中正确选项", () => {
  const q: ChoiceQuestion = {
    id: "intro-2",
    type: "single",
    prompt: "大模型能自己干活吗？",
    options: ["能", "不能"],
    answer: [1],
    explain: "",
  };
  assert.equal(gradeChoice(q, [1]), true);
  assert.equal(gradeChoice(q, [0]), false);
});

test("gradeChoice: 单选多选一个也判错", () => {
  const q: ChoiceQuestion = {
    id: "intro-2",
    type: "single",
    prompt: "x",
    options: ["a", "b"],
    answer: [1],
    explain: "",
  };
  assert.equal(gradeChoice(q, [0, 1]), false);
});

test("gradeChoice: 多选顺序无关", () => {
  const q: ChoiceQuestion = {
    id: "intro-1",
    type: "multiple",
    prompt: "核心循环包含哪几步？",
    options: ["调用模型", "执行工具", "回填结果", "训练模型"],
    answer: [0, 1, 2],
    explain: "",
  };
  assert.equal(gradeChoice(q, [2, 0, 1]), true);
  assert.equal(gradeChoice(q, [0, 1]), false); // 漏选
  assert.equal(gradeChoice(q, [0, 1, 2, 3]), false); // 多选
});

test("gradeFill: 逐空比对，忽略首尾空格与大小写", () => {
  const q: FillQuestion = {
    id: "loop-fill-1",
    type: "fill",
    prompt: "补全核心循环代码",
    template: "for (...) { const reply = await callLLM(messages); if (reply.___.length === 0) return messages; }",
    blanks: ["tool_calls", "push"],
    explain: "",
  };
  assert.equal(gradeFill(q, ["tool_calls", "push"]), true);
  assert.equal(gradeFill(q, ["TOOL_CALLS", " push "]), true);
  assert.equal(gradeFill(q, ["tool", "push"]), false);
  assert.equal(gradeFill(q, ["tool_calls"]), false); // 缺一个空
});

test("gradeOrder: 顺序必须完全一致", () => {
  const q: OrderQuestion = {
    id: "loop-order-1",
    type: "order",
    prompt: "给核心循环四步排正确顺序",
    items: ["执行工具", "调用模型", "判断结束", "回填结果"],
    answer: [1, 0, 3, 2],
    explain: "",
  };
  assert.equal(gradeOrder(q, [1, 0, 3, 2]), true);
  assert.equal(gradeOrder(q, [0, 1, 2, 3]), false);
  assert.equal(gradeOrder(q, [1, 0, 3]), false); // 缺项
});
