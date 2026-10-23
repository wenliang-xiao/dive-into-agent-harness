"use client";

import { useState, type ReactNode } from "react";
import { useRunnerConfig } from "./runner-config";

// ── 类型 ──────────────────────────────────────────────────────

export type TraceEvent =
  | { type: "model_call"; turn: number; messages: { role: string; content: string }[] }
  | { type: "model_reply"; turn: number; reply: { content: string; tool_calls?: { function: { name: string; arguments: string } }[] } }
  | { type: "tool_call"; turn: number; name: string; args: string }
  | { type: "tool_result"; turn: number; result: string }
  | { type: "done"; answer: string }
  | { type: "max_turns_reached" }
  | { type: "error"; message: string };

/** 一个可编辑的实验参数 */
export type ExperimentParam = {
  key: string;
  label: string;
  type: "number" | "text";
  defaultValue: string;
  hint?: string;
};

export type CodeRunnerProps = {
  title?: string;
  /** 代码行；可编辑的值用 [[paramKey]] 占位 */
  codeLines: string[];
  /** trace 事件类型 → 高亮行号（1-based） */
  highlightMap: Record<string, number>;
  /** 可编辑参数 */
  params: ExperimentParam[];
  defaultRequest: string;
};

const STEPS = [
  { id: "call", label: "① 调用模型" },
  { id: "judge", label: "② 判断" },
  { id: "execute", label: "③ 执行工具" },
  { id: "feedback", label: "④ 回填" },
];

// ── 代码块（占位符替换 + 逐行高亮）──────────────────────────────

function CodeBlock({
  codeLines,
  values,
  highlightLine,
}: {
  codeLines: string[];
  values: Record<string, string>;
  highlightLine: number | null;
}) {
  return (
    <div className="overflow-x-auto border-b border-line bg-code-bg/40 py-3">
      <pre className="min-w-max font-mono text-[12px] leading-6">
        {codeLines.map((line, i) => {
          const lineNo = i + 1;
          const active = highlightLine === lineNo;
          return (
            <div
              key={i}
              className={`flex border-l-2 px-4 ${
                active
                  ? "border-accent bg-accent/15"
                  : "border-transparent"
              }`}
            >
              <span
                className={`w-7 select-none pr-3 text-right ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                {lineNo}
              </span>
              <span className="whitespace-pre">{renderInline(line, values)}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/** 把 [[key]] 替换成高亮的参数值 */
function renderInline(
  line: string,
  values: Record<string, string>,
): ReactNode[] {
  const parts = line.split(/(\[\[[a-zA-Z]+\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[([a-zA-Z]+)\]\]$/);
    if (m) {
      const key = m[1];
      return (
        <span
          key={i}
          className="rounded bg-accent/20 px-1 font-semibold text-accent"
        >
          {values[key] ?? `[[${key}]]`}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ── 动态流程图 ────────────────────────────────────────────────

function FlowDiagram({ step }: { step: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-4 py-2">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1">
          <div
            className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
              step === s.id
                ? "border-accent bg-accent/10 font-medium text-accent"
                : step === "done"
                  ? "border-ok bg-ok/10 text-ok"
                  : "border-line text-muted"
            }`}
          >
            {s.label}
          </div>
          {i < STEPS.length - 1 && <span className="text-xs text-muted">→</span>}
        </div>
      ))}
      {step === "done" && (
        <div className="ml-1 rounded-md border border-ok bg-ok/10 px-2 py-1 text-[11px] text-ok">✅</div>
      )}
      {step === "error" && (
        <div className="ml-1 rounded-md border border-danger bg-danger/10 px-2 py-1 text-[11px] text-danger">❌</div>
      )}
    </div>
  );
}

// ── trace 输出 ────────────────────────────────────────────────

function TraceLog({ events }: { events: TraceEvent[] }) {
  return (
    <div className="max-h-56 space-y-1 overflow-y-auto px-4 py-2.5 font-mono text-[12px]">
      {events.length === 0 && (
        <p className="text-muted">点「运行」，左边代码逐行高亮，这里同步打印每一步…</p>
      )}
      {events.map((e, i) => (
        <div key={i} className="leading-relaxed">
          {e.type === "model_call" && (
            <p className="text-muted">[{e.turn}] L7 调用模型（喂入 {e.messages.length} 条消息）</p>
          )}
          {e.type === "model_reply" &&
            (e.reply.tool_calls?.length ? (
              <p>
                <span className="text-accent">[{e.turn}] L8 模型想调工具:</span>{" "}
                {e.reply.tool_calls.map((tc) => `${tc.function.name}(${tc.function.arguments})`).join(", ")}
              </p>
            ) : (
              <p className="text-ink">[{e.turn}] L8 模型回答: {e.reply.content}</p>
            ))}
          {e.type === "tool_call" && (
            <p>
              <span className="text-ok">[{e.turn}] L13 执行工具</span> {e.name}({e.args})
            </p>
          )}
          {e.type === "tool_result" && (
            <p className="text-muted">[{e.turn}] L14 工具结果: {e.result}</p>
          )}
          {e.type === "done" && <p className="font-bold text-ok">✅ L10 返回最终答案: {e.answer}</p>}
          {e.type === "max_turns_reached" && <p className="text-warn">⚠️ L17 达到轮数上限</p>}
          {e.type === "error" && <p className="text-danger">❌ {e.message}</p>}
        </div>
      ))}
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────

export function CodeRunner({
  title = "⚡ 亲手跑一遍",
  codeLines,
  highlightMap,
  params,
  defaultRequest,
}: CodeRunnerProps) {
  const { config } = useRunnerConfig();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(params.map((p) => [p.key, p.defaultValue])),
  );
  const [request, setRequest] = useState(defaultRequest);
  const [showParams, setShowParams] = useState(true);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [step, setStep] = useState("idle");

  const applyEvent = (e: TraceEvent) => {
    const line = highlightMap[e.type];
    if (line) setHighlightLine(line);
    switch (e.type) {
      case "model_call": setStep("call"); break;
      case "model_reply": setStep(e.reply.tool_calls?.length ? "judge" : "done"); break;
      case "tool_call": setStep("execute"); break;
      case "tool_result": setStep("feedback"); break;
      case "done": setStep("done"); break;
      case "error": setStep("error"); break;
    }
  };

  const run = async () => {
    setRunning(true);
    setEvents([]);
    setStep("call");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          request,
          systemPrompt: values.systemPrompt,
          toolName: values.toolName,
          maxTurns: Number(values.maxTurns),
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
            const evt = JSON.parse(line.slice(6)) as TraceEvent;
            setEvents((prev) => [...prev, evt]);
            applyEvent(evt);
          } catch {
            /* 忽略半截 JSON */
          }
        }
      }
    } catch (e) {
      setEvents((prev) => [...prev, { type: "error", message: String(e) }]);
      setStep("error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-paper">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParams(!showParams)}
            className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-ink"
          >
            {showParams ? "收起参数" : "实验参数"}
          </button>
          <button
            onClick={run}
            disabled={running}
            className="rounded-md bg-accent px-3 py-1 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {running ? "运行中…" : "▶ 运行"}
          </button>
        </div>
      </div>

      <FlowDiagram step={step} />

      {/* 实验参数面板 */}
      {showParams && (
        <div className="grid gap-2 border-b border-line bg-code-bg/40 px-4 py-3 text-xs sm:grid-cols-3">
          {params.map((p) => (
            <label key={p.key} className="flex flex-col gap-1">
              <span className="text-muted">{p.label}</span>
              <input
                type={p.type === "number" ? "number" : "text"}
                value={values[p.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                }
                className="rounded-md border border-line bg-paper px-2 py-1"
              />
              {p.hint && <span className="text-[10px] text-muted">{p.hint}</span>}
            </label>
          ))}
        </div>
      )}

      {/* 代码块（可编辑值高亮 + 逐行执行高亮） */}
      <CodeBlock codeLines={codeLines} values={values} highlightLine={highlightLine} />

      {/* 请求输入 */}
      <div className="flex gap-2 border-b border-line px-4 py-2.5">
        <span className="self-center text-xs text-muted">user:</span>
        <input
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          className="flex-1 rounded-md border border-line bg-paper px-3 py-1.5 text-sm"
        />
      </div>

      <TraceLog events={events} />
    </div>
  );
}
