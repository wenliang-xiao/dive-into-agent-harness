/**
 * Step 05 · 多 agent 编排
 *
 * ── 根源：为什么单 agent 不够 ──
 *
 * 前面四章都是「一个 agent 干所有事」。单 agent 有两个硬伤：
 *   1. 上下文爆炸：复杂任务要读几十个文件、跑几十次工具，
 *      中间过程全堆在同一个窗口里，很快 Context Rot（step-03）。
 *   2. 任务混杂：既要调研、又要实现、还要验收，一个「大脑」
 *      来回切换，效率低、易分心。
 *
 * 解法是把大任务拆给多个 agent 并行干。核心价值一句话：
 *   【把子任务的探索与中间过程，隔离在独立上下文里，
 *     主 agent 只拿结论】——这是 step-03「Isolate」策略的落地。
 *
 * 于是有两个角色：
 *   协调者（coordinator）：拆任务、派发、验收，不自己搬砖。
 *   worker：独立的消息数组（= 独立状态），跑自己的循环。
 */

export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

type Config = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  /** 并行派发（true）还是串行（false） */
  parallel?: boolean;
};

// ── worker：独立循环 + 独立上下文 ────────────────────────────
// 关键：worker 有自己的 messages（自己的状态），
// 它的探索、试错、中间过程都留在自己的窗口里，不污染主 agent。
async function runAgent(
  systemPrompt: string,
  userRequest: string,
  tools: Tool[],
  config: Config,
): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userRequest },
  ];

  for (let turn = 0; turn < 10; turn++) {
    const reply = await callLLM(messages, tools, config);
    messages.push(reply as Message);
    const toolCalls = (reply as { tool_calls?: { id: string; function: { name: string; arguments: string } }[] }).tool_calls ?? [];
    if (toolCalls.length === 0) return (reply as Message).content;
    for (const tc of toolCalls) {
      const tool = tools.find((t) => t.name === tc.function.name);
      const result = tool
        ? String(await tool.execute(JSON.parse(tc.function.arguments)))
        : `错误：未知工具 ${tc.function.name}`;
      messages.push({ role: "tool", content: result });
    }
  }
  return "（达到轮数上限）";
}

// ── 派发一个 worker ──────────────────────────────────────────
// 只返回 worker 的最终结论，主 agent 看不到它的中间过程。
async function dispatchWorker(task: string, tools: Tool[], config: Config): Promise<string> {
  return runAgent(
    "你是专注执行子任务的 worker，完成后只返回结论，不要解释过程。",
    task,
    tools,
    config,
  );
}

// ── 协调者：拆任务 → 派发 → 汇总 ─────────────────────────────
export async function coordinator(
  subtasks: string[],
  tools: Tool[],
  config: Config = {},
  onEvent?: (e: unknown) => void,
): Promise<string[]> {
  const run = async (task: string, i: number) => {
    onEvent?.({ type: "worker_start", index: i, task });
    const conclusion = await dispatchWorker(task, tools, config);
    onEvent?.({ type: "worker_done", index: i, conclusion });
    return conclusion;
  };

  if (config.parallel === false) {
    // 串行：一个接一个
    const results: string[] = [];
    for (let i = 0; i < subtasks.length; i++) {
      results.push(await run(subtasks[i], i));
    }
    return results;
  }
  // 并行（默认）：同时跑
  return Promise.all(subtasks.map(run));
}

async function callLLM(messages: Message[], tools: Tool[], config: Config) {
  const base = (config.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })),
    }),
  });
  if (!res.ok) throw new Error(`API 调用失败: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message;
}
