"use client";

import { useState } from "react";
import type {
  ChoiceQuestion,
  FillQuestion,
  OrderQuestion,
  Question,
} from "@/lib/quiz/types";
import { gradeChoice, gradeFill, gradeOrder } from "@/lib/quiz/grade";

/** 回忆题答错才进错题本；选择题是自测，不持久化 */
async function recordAnswer(q: Question, correct: boolean) {
  try {
    await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterSlug: q.id.split("-")[0],
        questionId: q.id,
        correct,
      }),
    });
  } catch {
    // 忽略提交失败，反馈仍可展示
  }
}

function ChoiceCard({ q, index }: { q: ChoiceQuestion; index: number }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const isMulti = q.type === "multiple";
  const correct = gradeChoice(q, selected);

  const toggle = (i: number) => {
    if (submitted) return;
    if (isMulti) {
      setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    } else {
      setSelected([i]);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="font-medium">
        {index + 1}. {q.prompt}
        {isMulti && <span className="ml-2 text-xs text-muted">（多选）</span>}
        <span className="ml-2 text-xs text-muted">自测</span>
      </p>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const showCorrect = submitted && q.answer.includes(i);
          const showWrong = submitted && isSel && !q.answer.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={submitted}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-ok bg-ok/10 text-ink"
                  : showWrong
                    ? "border-danger bg-danger/10 text-ink"
                    : isSel
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line hover:border-muted"
              }`}
            >
              <span className="mr-2 text-muted">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selected.length === 0}
          className="mt-3 rounded-md bg-accent px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          提交
        </button>
      ) : (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            correct ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
          }`}
        >
          {correct ? "✓ 答对了！" : "✗ 答错了。"} {q.explain}
        </p>
      )}
    </div>
  );
}

function FillCard({ q, index }: { q: FillQuestion; index: number }) {
  const [answers, setAnswers] = useState<string[]>(() =>
    Array(q.blanks.length).fill(""),
  );
  const [submitted, setSubmitted] = useState(false);
  const correct = gradeFill(q, answers);

  const setBlank = (i: number, v: string) =>
    setAnswers((prev) => prev.map((x, j) => (j === i ? v : x)));

  const parts = q.template.split("___");

  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="font-medium">
        {index + 1}. {q.prompt}
        <span className="ml-2 text-xs text-muted">回忆练习 · 计入错题本</span>
      </p>
      <pre className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-code-bg/40 px-3 py-2 font-mono text-[13px] leading-7 text-ink">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 && (
              <input
                value={answers[i]}
                onChange={(e) => setBlank(i, e.target.value)}
                disabled={submitted}
                placeholder="___"
                className={`mx-1 inline-block w-28 rounded border px-2 py-0.5 font-mono text-[13px] ${
                  submitted
                    ? answers[i].trim().toLowerCase() ===
                      q.blanks[i].trim().toLowerCase()
                      ? "border-ok bg-ok/10 text-ok"
                      : "border-danger bg-danger/10 text-danger"
                    : "border-line bg-paper"
                }`}
              />
            )}
          </span>
        ))}
      </pre>
      {!submitted ? (
        <button
          onClick={() => {
            setSubmitted(true);
            void recordAnswer(q, correct);
          }}
          disabled={answers.some((a) => a.trim() === "")}
          className="mt-3 rounded-md bg-accent px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          提交
        </button>
      ) : (
        <div className="mt-3">
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              correct ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
            }`}
          >
            {correct ? "✓ 答对了！" : "✗ 答错了。"} {q.explain}
          </p>
          {!correct && (
            <p className="mt-2 text-sm text-muted">
              正确答案：{q.blanks.map((b) => `「${b}」`).join("、")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ q, index }: { q: OrderQuestion; index: number }) {
  const [order, setOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const correct = gradeOrder(q, order);

  const toggle = (i: number) => {
    if (submitted) return;
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  };

  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="font-medium">
        {index + 1}. {q.prompt}
        <span className="ml-2 text-xs text-muted">回忆练习 · 计入错题本</span>
      </p>
      <div className="mt-3 space-y-2">
        {q.items.map((item, i) => {
          const pos = order.indexOf(i);
          const isCorrectPos = submitted && q.answer[pos] === i;
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={submitted}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                submitted
                  ? isCorrectPos
                    ? "border-ok bg-ok/10 text-ink"
                    : "border-danger bg-danger/10 text-ink"
                  : pos >= 0
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line hover:border-muted"
              }`}
            >
              <span
                className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded text-xs ${
                  pos >= 0 ? "bg-accent text-white" : "text-muted"
                }`}
              >
                {pos >= 0 ? pos + 1 : "○"}
              </span>
              {item}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          onClick={() => {
            setSubmitted(true);
            void recordAnswer(q, correct);
          }}
          disabled={order.length !== q.items.length}
          className="mt-3 rounded-md bg-accent px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          提交
        </button>
      ) : (
        <div className="mt-3">
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              correct ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
            }`}
          >
            {correct ? "✓ 答对了！" : "✗ 答错了。"} {q.explain}
          </p>
          {!correct && (
            <p className="mt-2 text-sm text-muted">
              正确顺序：{q.answer.map((idx) => q.items[idx]).join(" → ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Quiz({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        if (q.type === "fill") return <FillCard key={q.id} q={q} index={i} />;
        if (q.type === "order") return <OrderCard key={q.id} q={q} index={i} />;
        return <ChoiceCard key={q.id} q={q} index={i} />;
      })}
    </div>
  );
}
