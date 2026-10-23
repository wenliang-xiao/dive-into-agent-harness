"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getChapter } from "@content/manifest";
import { getQuestions } from "@/lib/quiz/questions";

type Mistake = {
  chapterSlug: string;
  questionId: string;
  wrongCount: number;
};

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mistakes")
      .then((r) => r.json())
      .then((d) => {
        setMistakes(d.mistakes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-bold">错题本</h1>
      <p className="mt-2 text-muted">答错的题都在这里，回顾、重做、攻克。</p>

      {loading ? (
        <p className="mt-8 text-muted">加载中…</p>
      ) : mistakes.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-paper p-6 text-muted">
          还没有错题。继续学习，答错会自动收进这里。
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {mistakes.map((m) => {
            const chapter = getChapter(m.chapterSlug);
            const q = getQuestions(m.chapterSlug).find(
              (x) => x.id === m.questionId,
            );
            return (
              <li
                key={`${m.chapterSlug}-${m.questionId}`}
                className="rounded-lg border border-line bg-paper p-4"
              >
                <p className="text-sm text-muted">
                  {chapter?.title ?? m.chapterSlug} · 错 {m.wrongCount} 次
                </p>
                <p className="mt-1 font-medium">{q?.prompt ?? m.questionId}</p>
                {q && (
                  <p className="mt-1 text-sm text-muted">{q.explain}</p>
                )}
                <Link
                  href={`/chapter/${m.chapterSlug}`}
                  className="mt-2 inline-block text-sm text-accent hover:underline"
                >
                  去重做 →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
