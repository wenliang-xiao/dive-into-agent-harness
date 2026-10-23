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

// 代码块：每一行就是上面「从零实现」的那段 runLoop（精简版）
const CODE_LINES = [
  "async function runLoop(userRequest, tools, config) {",
  "  const messages = [",
  '    { role: "system", content: "你是助手，需要计算时调用 calculator。" },',
  "    { role: \"user\", content: userRequest },",
  "  ];",
  "  for (let turn = 0; turn < maxTurns; turn++) {",
  "    const reply = await callLLM(messages, tools);",
  "    messages.push(reply);",
  "    const toolCalls = reply.tool_calls ?? [];",
  "    if (toolCalls.length === 0) return messages;",
  "    for (const tc of toolCalls) {",
  "      const tool = tools.find(t => t.name === tc.function.name);",
  "      const result = String(await tool.execute(JSON.parse(tc.function.arguments)));",
  "      messages.push({ role: \"tool\", content: result, tool_call_id: tc.id });",
  "    }",
  "  }",
  "  return messages;",
  "}",
];

// trace 事件类型 → 高亮的代码行（1-based）
const HIGHLIGHT: Record<string, number> = {
  model_call: 7, // callLLM
  model_reply: 8, // push reply
  tool_call: 13, // tool.execute
  tool_result: 14, // push tool result
  done: 10, // return messages
  max_turns_reached: 17,
};

const STEPS = [
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
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [step, setStep] = useState("idle");

  const updateCfg = (k: string, v: string) => {
    const next = { ...cfg, [k]: v };
    setCfg(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("d2a-run-config", JSON.stringify(next));
    }
  };

  const applyEvent = (e: TraceEvent) => {
    const line = HIGHLIGHT[e.type];
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
        <span className="text-sm font-medium">⚡ 亲手跑一遍（下面这段代码）</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCfg(!showCfg)}
            className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-ink"
          >
            {showCfg ? "收起配置" : "配置 API"}
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

      {/* 配置面板 */}
      {showCfg && (
        <div className="grid gap-2 border-b border-line bg-code-bg/50 px-4 py-3 text-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Base URL</span>
            <input value={cfg.baseUrl ?? ""} onChange={(e) => updateCfg("baseUrl", e.target.value)} placeholder="https://api.openai.com/v1" className="rounded-md border border-line bg-paper px-2 py-1" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">模型</span>
            <input value={cfg.model ?? ""} onChange={(e) => updateCfg("model", e.target.value)} placeholder="gpt-4o" className="rounded-md border border-line bg-paper px-2 py-1" />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">API Key（只存你本地浏览器，仅本次请求用）</span>
            <input type="password" value={cfg.apiKey ?? ""} onChange={(e) => updateCfg("apiKey", e.target.value)} placeholder="sk-..." className="rounded-md border border-line bg-paper px-2 py-1" />
          </label>
        </div>
      )}

      {/* 动态流程图 */}
      <div className="border-b border-line px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
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
          {step === "done" && <div className="ml-1 rounded-md border border-ok bg-ok/10 px-2 py-1 text-[11px] text-ok">✅ 完成</div>}
          {step === "error" && <div className="ml-1 rounded-md border border-danger bg-danger/10 px-2 py-1 text-[11px] text-danger">❌ 出错</div>}
        </div>
      </div>

      {/* 代码块（逐行高亮） */}
      <div className="border-b border-line bg-code-bg/40 px-0 py-3">
        <div className="overflow-x-auto">
          <pre className="min-w-max px-0 font-mono text-[12px] leading-6">
            {CODE_LINES.map((code, i) => {
              const lineNo = i + 1;
              const active = highlightLine === lineNo;
              return (
                <div
                  key={i}
                  className={`flex px-4 ${active ? "bg-accent/15" : ""} ${active ? "border-l-2 border-accent" : "border-l-2 border-transparent"}`}
                >
                  <span className={`w-7 select-none pr-3 text-right ${active ? "text-accent" : "text-muted"}`}>{lineNo}</span>
                  <span className={active ? "text-ink" : "text-ink"}>{code}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* 请求输入 */}
      <div className="flex gap-2 border-b border-line px-4 py-2.5">
        <span className="self-center text-xs text-muted">user:</span>
        <input
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          className="flex-1 rounded-md border border-line bg-paper px-3 py-1.5 text-sm"
        />
      </div>

      {/* trace 输出 */}
      <div className="px-4 py-2.5">
        <div className="max-h-56 space-y-1 overflow-y-auto font-mono text-[12px]">
          {events.length === 0 && <p className="text-muted">点「运行」后，左边代码会逐行高亮，这里同步打印每一步…</p>}
          {events.map((e, i) => (
            <div key={i} className="leading-relaxed">
              {e.type === "model_call" && <p className="text-muted">[{e.turn}] L7 调用模型（喂入 {e.messages.length} 条消息）</p>}
              {e.type === "model_reply" &&
                (e.reply.tool_calls?.length ? (
                  <p><span className="text-accent">[{e.turn}] L8 模型想调工具:</span> {e.reply.tool_calls.map((tc) => `${tc.function.name}(${tc.function.arguments})`).join(", ")}</p>
                ) : (
                  <p className="text-ink">[{e.turn}] L8 模型回答: {e.reply.content}</p>
                ))}
              {e.type === "tool_call" && <p><span className="text-ok">[{e.turn}] L13 执行工具</span> {e.name}({e.args})</p>}
              {e.type === "tool_result" && <p className="text-muted">[{e.turn}] L14 工具结果: {e.result}</p>}
              {e.type === "done" && <p className="font-bold text-ok">✅ L10 返回最终答案: {e.answer}</p>}
              {e.type === "max_turns_reached" && <p className="text-warn">⚠️ L17 达到轮数上限</p>}
              {e.type === "error" && <p className="text-danger">❌ {e.message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
