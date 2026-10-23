"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "@content/manifest";

export default function ProgressPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        setCompleted(d.completed ?? []);
        setStreak(d.streak ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pct = loading
    ? 0
    : Math.round((completed.length / chapters.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-bold">学习进度</h1>

      {loading ? (
        <p className="mt-8 text-muted">加载中…</p>
      ) : (
        <>
          <div className="mt-6 flex gap-4">
            <div className="flex-1 rounded-lg border border-line bg-paper p-5 text-center">
              <p className="text-3xl font-bold text-accent">{streak} 天</p>
              <p className="mt-1 text-sm text-muted">连续打卡</p>
            </div>
            <div className="flex-1 rounded-lg border border-line bg-paper p-5 text-center">
              <p className="text-3xl font-bold text-accent">{pct}%</p>
              <p className="mt-1 text-sm text-muted">
                完成 {completed.length}/{chapters.length} 章
              </p>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-code-bg">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ul className="mt-8 space-y-2">
            {chapters.map((c) => {
              const done = completed.includes(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/chapter/${c.slug}`}
                    className="flex items-center gap-3 rounded-md border border-line bg-paper px-4 py-2.5 transition-colors hover:border-accent"
                  >
                    <span className={done ? "text-ok" : "text-muted"}>
                      {done ? "✓" : "○"}
                    </span>
                    <span className="flex-1">{c.title}</span>
                    <span className="text-xs text-muted">{c.summary}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
