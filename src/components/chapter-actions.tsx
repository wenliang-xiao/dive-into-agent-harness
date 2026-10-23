"use client";

import { useEffect, useState } from "react";

export function ChapterActions({ slug }: { slug: string }) {
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        setCompleted(d.completed?.includes(slug) ?? false);
        setStreak(d.streak ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const markComplete = async () => {
    await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterSlug: slug }),
    });
    setCompleted(true);
  };

  if (loading) return null;

  return (
    <div className="mt-8 flex items-center gap-3 rounded-lg border border-line bg-paper p-4">
      <button
        onClick={markComplete}
        disabled={completed}
        className={`rounded-md px-4 py-2 text-sm transition-colors ${
          completed
            ? "bg-ok/15 text-ok"
            : "bg-accent text-white hover:opacity-90"
        }`}
      >
        {completed ? "✓ 已学完本章" : "标记本章完成"}
      </button>
      <span className="text-sm text-muted">
        🔥 连续打卡 <strong className="text-ink">{streak}</strong> 天
      </span>
    </div>
  );
}
