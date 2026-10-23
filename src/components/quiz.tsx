"use client";

import { useState } from "react";
import type { Question } from "@/lib/quiz/types";

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const isMulti = q.type === "multiple";
  const correct =
    selected.length === q.answer.length &&
    q.answer.every((a) => selected.includes(a));

  const toggle = (i: number) => {
    if (submitted) return;
    if (isMulti) {
      setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    } else {
      setSelected([i]);
    }
  };

  const submit = async () => {
    if (selected.length === 0 || submitted) return;
    setSubmitted(true);
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
  };

  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="font-medium">
        {index + 1}. {q.prompt}
        {isMulti && <span className="ml-2 text-xs text-muted">（多选）</span>}
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
          onClick={submit}
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

export function Quiz({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} />
      ))}
    </div>
  );
}
