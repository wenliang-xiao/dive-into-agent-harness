/**
 * Step 01 · 核心循环
 *
 * ── 根源：为什么 agent 一定是「一个循环 + 一个消息数组」 ──
 *
 * LLM 是一个【无状态函数】：
 *
 *     f(messages) -> message
 *
 * 输入一串消息，输出一条消息。它不记得上一次调用 —— 你这次问
 * 「123*456 等于多少」，它不知道上一轮它刚调过 calculator。
 *
 * 但 agent 需要【有状态】：它得记住「我算完了，结果是 56088」，
 * 才能继续下一步。
 *
 * 让无状态的 LLM 变成有状态的 agent，办法只有一个：
 *   把历史消息【全部喂回去】。
 *
 * 于是两个结论自动浮出水面：
 *   1. 消息数组 = agent 的全部状态（除此之外没有任何「记忆」）。
 *   2. 循环 = 反复调用 f，每次把新消息（模型回复、工具结果）
 *      追加到数组末尾，再喂回去 —— 直到模型不再要求调工具。
 *
 * 这就是为什么 pi / opencode / Claude Code 的核心，都是一个
 * while 循环 + 一个消息数组，无一例外。本章写的就是这个循环。
 */

// ── 1. 消息：agent 的唯一状态 ─────────────────────────────────
export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  /** assistant 消息可能携带的工具调用（模型的「意图」） */
  tool_calls?: ToolCall[];
  /** tool 消息用这个 id 关联回它对应的那次 tool_call */
  tool_call_id?: string;
};

export type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

// ── 2. 工具：模型能「调用」的东西 ─────────────────────────────
export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

// ── 3. 运行配置：支持用自己的 key / baseUrl / 模型 ────────────
export type RunConfig = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  maxTurns?: number;
};

// ── 4. 可观测：循环每一步发一个 trace 事件 ─────────────────────
// CLI 用它打印轨迹，网页用它画实时流程图。同一份代码，两种呈现。
export type TraceEvent =
  | { type: "model_call"; turn: number; messages: Message[] }
  | { type: "model_reply"; turn: number; reply: Message }
  | { type: "tool_call"; turn: number; name: string; args: string }
  | { type: "tool_result"; turn: number; result: string }
  | { type: "done"; answer: string }
  | { type: "max_turns_reached" };

// ── 5. 调用模型：无状态函数 f ─────────────────────────────────
async function callLLM(
  messages: Message[],
  tools: Tool[],
  config: RunConfig,
): Promise<Message> {
  const base = (config.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`API 调用失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices[0].message;
}

// ── 6. 核心循环 ──────────────────────────────────────────────
export async function runLoop(
  userRequest: string,
  tools: Tool[],
  config: RunConfig = {},
  onEvent?: (e: TraceEvent) => void,
): Promise<Message[]> {
  const maxTurns = config.maxTurns ?? 10;
  const messages: Message[] = [
    { role: "system", content: "你是一个助手，需要计算时调用 calculator 工具。" },
    { role: "user", content: userRequest },
  ];

  for (let turn = 0; turn < maxTurns; turn++) {
    // ① 调用模型
    onEvent?.({ type: "model_call", turn, messages: [...messages] });
    const reply = await callLLM(messages, tools, config);
    onEvent?.({ type: "model_reply", turn, reply });
    messages.push(reply);

    // ② 判断：有工具调用吗？
    const toolCalls = reply.tool_calls ?? [];
    if (toolCalls.length === 0) {
      onEvent?.({ type: "done", answer: reply.content });
      return messages;
    }

    // ③ 执行 + 回填
    for (const tc of toolCalls) {
      onEvent?.({ type: "tool_call", turn, name: tc.function.name, args: tc.function.arguments });
      const tool = tools.find((t) => t.name === tc.function.name);
      let result: string;
      if (!tool) {
        result = `错误：未知工具 ${tc.function.name}`;
      } else {
        try {
          result = String(await tool.execute(JSON.parse(tc.function.arguments)));
        } catch (e) {
          result = `错误：${e instanceof Error ? e.message : String(e)}`;
        }
      }
      onEvent?.({ type: "tool_result", turn, result });
      messages.push({ role: "tool", content: result, tool_call_id: tc.id });
    }
  }

  onEvent?.({ type: "max_turns_reached" });
  return messages;
}
