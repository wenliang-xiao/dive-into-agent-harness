"use client";

import { useState } from "react";

type TraceEvent =
  | { type: "model_call"; turn: number; messages: { role: string; content: string }[] }
  | { type: "model_reply"; turn: number; reply: { content: string; tool_calls?: { function: { name: string; arguments: string } }[] } }
  | { type: "tool_call"; turn: number; name: string; args: string }
  | { type: "tool_result"; turn: number; result: string }
  | { type: "done"; answer: string }
  | { type: "max_turns_reached" }
  | { type: "error"; message: string };

// 循环状态机的四个阶段
type Step = "idle" | "call" | "judge" | "execute" | "feedback" | "done" | "error";

const STEPS: { id: Step; label: string; sub: string }[] = [
  { id: "call", label: "① 调用模型", sub: "喂入消息数组" },
  { id: "judge", label: "② 判断", sub: "要调工具吗？" },
  { id: "execute", label: "③ 执行工具", sub: "真正跑函数" },
  { id: "feedback", label: "④ 回填结果", sub: "push 回消息数组" },
];

function loadConfig() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("d2a-run-config") ?? "{}");
  } catch {
    return {};
  }
}

export function InteractiveRunner() {
  const [cfg, setCfg] = useState(() => loadConfig());
  const [showCfg, setShowCfg] = useState(false);
  const [request, setRequest] = useState("帮我算一下 123 * 456 等于多少");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [step, setStep] = useState<Step>("idle");

  const updateCfg = (k: string, v: string) => {
    const next = { ...cfg, [k]: v };
    setCfg(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("d2a-run-config", JSON.stringify(next));
    }
  };

  const applyEvent = (e: TraceEvent) => {
    switch (e.type) {
      case "model_call": setStep("call"); break;
      case "model_reply":
        setStep(e.reply.tool_calls?.length ? "judge" : "done");
        break;
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
        body: JSON.stringify({ ...cfg, request }),
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
            // 忽略半截 JSON
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
    <div className="my-6 rounded-xl border border-line bg-paper">
      {/* 头部 + 运行按钮 */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-medium">⚡ 亲手跑一遍</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCfg(!showCfg)}
            className="rounded-md border border-line px-2.5 py-1 text-sm text-muted hover:text-ink"
          >
            {showCfg ? "收起配置" : "配置 API"}
          </button>
          <button
            onClick={run}
            disabled={running}
            className="rounded-md bg-accent px-3 py-1 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {running ? "运行中…" : "▶ 运行"}
          </button>
        </div>
      </div>

      {/* 配置面板 */}
      {showCfg && (
        <div className="grid gap-2 border-b border-line bg-code-bg/50 px-4 py-3 text-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-muted">Base URL</span>
            <input
              value={cfg.baseUrl ?? ""}
              onChange={(e) => updateCfg("baseUrl", e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="rounded-md border border-line bg-paper px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-muted">模型</span>
            <input
              value={cfg.model ?? ""}
              onChange={(e) => updateCfg("model", e.target.value)}
              placeholder="gpt-4o"
              className="rounded-md border border-line bg-paper px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-muted">API Key（只存你本地浏览器，仅本次请求用）</span>
            <input
              type="password"
              value={cfg.apiKey ?? ""}
              onChange={(e) => updateCfg("apiKey", e.target.value)}
              placeholder="sk-..."
              className="rounded-md border border-line bg-paper px-2 py-1"
            />
          </label>
        </div>
      )}

      {/* 请求输入 */}
      <div className="flex gap-2 px-4 py-3">
        <input
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
      </div>

      {/* 动态流程图 */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div
                className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  step === s.id
                    ? "border-accent bg-accent/10 font-medium text-accent"
                    : step === "done"
                      ? "border-ok bg-ok/10 text-ok"
                      : "border-line text-muted"
                }`}
              >
                <div>{s.label}</div>
                <div className="text-[10px] opacity-70">{s.sub}</div>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`text-xs ${step !== "idle" && step !== "error" ? "text-accent" : "text-muted"}`}
                >
                  →
                </span>
              )}
            </div>
          ))}
          {step === "done" && (
            <div className="ml-1 whitespace-nowrap rounded-md border border-ok bg-ok/10 px-3 py-1.5 text-xs text-ok">
              ✅ 完成
            </div>
          )}
          {step === "error" && (
            <div className="ml-1 whitespace-nowrap rounded-md border border-danger bg-danger/10 px-3 py-1.5 text-xs text-danger">
              ❌ 出错
            </div>
          )}
        </div>
        {step === "feedback" && (
          <p className="text-[11px] text-muted">
            ↺ 结果回填后，循环回到 ①，模型「看到」结果再决定下一步
          </p>
        )}
      </div>

      {/* trace 输出 */}
      <div className="border-t border-line px-4 py-3">
        <div className="max-h-72 space-y-1.5 overflow-y-auto font-mono text-xs">
          {events.length === 0 && (
            <p className="text-muted">点「运行」后，这里会实时打印循环的每一步 trace…</p>
          )}
          {events.map((e, i) => (
            <div key={i} className="leading-relaxed">
              {e.type === "model_call" && (
                <p className="text-muted">[{e.turn}] 调用模型（喂入 {e.messages.length} 条消息）</p>
              )}
              {e.type === "model_reply" &&
                (e.reply.tool_calls?.length ? (
                  <p>
                    <span className="text-accent">[{e.turn}] 模型想调工具:</span>{" "}
                    {e.reply.tool_calls.map((tc) => `${tc.function.name}(${tc.function.arguments})`).join(", ")}
                  </p>
                ) : (
                  <p className="text-ink">[{e.turn}] 模型回答: {e.reply.content}</p>
                ))}
              {e.type === "tool_call" && (
                <p>
                  <span className="text-ok">[{e.turn}] 执行工具</span> {e.name}({e.args})
                </p>
              )}
              {e.type === "tool_result" && (
                <p className="text-muted">[{e.turn}] 工具结果: {e.result}</p>
              )}
              {e.type === "done" && <p className="font-bold text-ok">✅ 最终答案: {e.answer}</p>}
              {e.type === "max_turns_reached" && (
                <p className="text-warn">⚠️ 达到轮数上限，循环被截断</p>
              )}
              {e.type === "error" && <p className="text-danger">❌ {e.message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
