"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractAnchor,
  loadAnnotations,
  locateRange,
  removeAnnotation,
  saveAnnotation,
  updateAnnotation,
  type Annotation,
} from "@/lib/annotations";
import { useRunnerConfig } from "./runner-config";

const HIGHLIGHT_NAME = "d2a-annotation";
const SECRET_KEY = "d2a-review-secret";

type ToolbarState = {
  x: number;
  y: number;
  quote: string;
  anchor: { quote: string; prefix: string; suffix: string };
};

export function SelectionAnnotation({
  slug,
  chapterTitle,
  children,
}: {
  slug: string;
  chapterTitle: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config } = useRunnerConfig();
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [commentDraft, setCommentDraft] = useState<ToolbarState | null>(null);
  const [commentText, setCommentText] = useState("");
  const [askDraft, setAskDraft] = useState<ToolbarState | null>(null);
  const [askText, setAskText] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [secret, setSecret] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);

  // 读本地评论 + 口令
  useEffect(() => {
    setAnnotations(loadAnnotations());
    setSecret(localStorage.getItem(SECRET_KEY) ?? "");
  }, []);

  // 高亮当前章节的评论
  useEffect(() => {
    const ranges: Range[] = [];
    const container = containerRef.current;
    if (container) {
      for (const a of annotations.filter((x) => x.slug === slug)) {
        const r = locateRange(container, a);
        if (r) ranges.push(r);
      }
    }
    try {
      const hl = new (window as unknown as { Highlight: typeof Highlight }).Highlight(...ranges);
      (CSS as unknown as { highlights: Map<string, Highlight> }).highlights.set(HIGHLIGHT_NAME, hl);
    } catch {
      /* 浏览器不支持 Custom Highlight，仅不显示高亮 */
    }
    return () => {
      try {
        (CSS as unknown as { highlights: Map<string, Highlight> }).highlights.delete(HIGHLIGHT_NAME);
      } catch {
        /* ignore */
      }
    };
  }, [annotations, slug]);

  const onMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const quote = range.toString().trim();
    if (!quote) {
      setToolbar(null);
      return;
    }
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setToolbar(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setToolbar({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
      quote,
      anchor: extractAnchor(range),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [onMouseUp]);

  const submitComment = () => {
    if (!commentDraft || !commentText.trim()) return;
    saveAnnotation({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug,
      quote: commentDraft.quote,
      prefix: commentDraft.anchor.prefix,
      suffix: commentDraft.anchor.suffix,
      comment: commentText.trim(),
      createdAt: new Date().toISOString(),
    });
    setAnnotations(loadAnnotations());
    setCommentDraft(null);
    setCommentText("");
    setToolbar(null);
  };

  const askAI = async () => {
    if (!askDraft || !askText.trim()) return;
    setAskLoading(true);
    setAskAnswer("");
    const systemPrompt = `你是《动手学智能体框架》这本书的助教。读者划选了书中一段文字并提问，请用简洁清晰的中文解答。划选内容：\n\n"${askDraft.quote}"`;
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          request: askText.trim(),
          systemPrompt,
          maxTurns: 3,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`请求失败 ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "done") setAskAnswer(evt.answer ?? "");
            else if (evt.type === "error") setAskAnswer(`❌ ${evt.message}`);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      setAskAnswer(`❌ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAskLoading(false);
    }
  };

  const submitIssue = async (a: Annotation) => {
    if (!secret.trim()) {
      alert("请先在下方「评审口令」里填入 REVIEW_SECRET");
      return;
    }
    setSubmitting(a.id);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const title = `[评审] ${chapterTitle} · ${a.quote.slice(0, 20)}`;
    const body = `### 章节\n[${chapterTitle}](${origin}/chapter/${a.slug})\n\n### 引文\n> ${a.quote}\n\n### 评论\n${a.comment}\n\n> 锚定：\`${a.prefix.slice(-20)}【${a.quote.slice(0, 20)}】${a.suffix.slice(0, 20)}\``;
    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `提交失败 ${res.status}`);
      updateAnnotation(a.id, { issueUrl: data.html_url });
      setAnnotations(loadAnnotations());
    } catch (e) {
      alert(`提交 issue 失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSubmitting(null);
    }
  };

  const chapterAnnotations = annotations.filter((x) => x.slug === slug);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {/* 浮动工具条 */}
      {toolbar && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-paper p-1 shadow-lg"
          style={{ left: toolbar.x, top: toolbar.y - 8 }}
        >
          <div className="flex items-center gap-1 text-xs">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setCommentDraft(toolbar);
                setCommentText("");
                setToolbar(null);
              }}
              className="rounded-md px-2 py-1 hover:bg-code-bg"
            >
              💬 评论
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setAskDraft(toolbar);
                setAskText("");
                setAskAnswer("");
                setToolbar(null);
              }}
              className="rounded-md px-2 py-1 hover:bg-code-bg"
            >
              🤖 问 AI
            </button>
          </div>
        </div>
      )}

      {/* 评论弹框 */}
      {commentDraft && (
        <Overlay onClose={() => setCommentDraft(null)}>
          <div className="mb-2 max-h-32 overflow-y-auto rounded-md border border-line bg-code-bg/40 p-2 text-sm text-muted">
            「{commentDraft.quote}」
          </div>
          <textarea
            autoFocus
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写评审意见…"
            className="h-24 w-full rounded-md border border-line bg-paper p-2 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setCommentDraft(null)} className="rounded-md border border-line px-3 py-1 text-sm text-muted hover:text-ink">
              取消
            </button>
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="rounded-md bg-accent px-3 py-1 text-sm text-white disabled:opacity-40"
            >
              保存评论
            </button>
          </div>
        </Overlay>
      )}

      {/* 问 AI 弹框 */}
      {askDraft && (
        <Overlay onClose={() => setAskDraft(null)}>
          <div className="mb-2 max-h-32 overflow-y-auto rounded-md border border-line bg-code-bg/40 p-2 text-sm text-muted">
            「{askDraft.quote}」
          </div>
          <input
            autoFocus
            value={askText}
            onChange={(e) => setAskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askAI()}
            placeholder="就这段文字提问，例如：这句话里的 One Gateway 是什么意思？"
            className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-sm"
          />
          {askAnswer && (
            <div className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-code-bg/40 p-2 text-sm">
              {askAnswer}
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setAskDraft(null)} className="rounded-md border border-line px-3 py-1 text-sm text-muted hover:text-ink">
              关闭
            </button>
            <button
              onClick={askAI}
              disabled={askLoading || !askText.trim()}
              className="rounded-md bg-accent px-3 py-1 text-sm text-white disabled:opacity-40"
            >
              {askLoading ? "回答中…" : "提问"}
            </button>
          </div>
        </Overlay>
      )}

      {/* 评论面板 */}
      <div className="mt-8 rounded-lg border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-sm font-medium">📝 本章评审（{chapterAnnotations.length}）</span>
          <span className="text-xs text-muted">划线选中正文即可评论 / 提问</span>
        </div>
        {chapterAnnotations.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted">暂无评论。选中正文文字，点「💬 评论」写下评审意见。</p>
        ) : (
          <ul className="divide-y divide-line">
            {chapterAnnotations.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <blockquote className="border-l-2 border-accent/40 pl-2 text-sm text-muted">「{a.quote}」</blockquote>
                <p className="mt-1.5 text-sm">{a.comment}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {a.issueUrl ? (
                    <a href={a.issueUrl} target="_blank" rel="noreferrer" className="text-ok">
                      ✅ 已提交 issue
                    </a>
                  ) : (
                    <button
                      onClick={() => submitIssue(a)}
                      disabled={submitting === a.id}
                      className="rounded-md border border-line px-2 py-0.5 text-muted hover:text-ink disabled:opacity-40"
                    >
                      {submitting === a.id ? "提交中…" : "提交 issue"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      removeAnnotation(a.id);
                      setAnnotations(loadAnnotations());
                    }}
                    className="text-muted hover:text-danger"
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
          <span className="text-xs text-muted">评审口令（提交 issue 用）</span>
          <input
            type="password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              localStorage.setItem(SECRET_KEY, e.target.value);
            }}
            placeholder="REVIEW_SECRET"
            className="flex-1 rounded-md border border-line bg-paper px-2 py-1 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-line bg-paper p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
