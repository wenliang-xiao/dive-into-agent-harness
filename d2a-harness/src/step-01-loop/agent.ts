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
// 四种角色，构成一次完整对话的最小单位。
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
// 声明（name/description/parameters）告诉模型「有什么、怎么用」；
// execute 是真正实现 —— 模型只给意图，执行永远在 harness 这边。
export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

export type LoopOptions = {
  /** 最大轮数保护：防止模型反复调同一个工具造成死循环 */
  maxTurns?: number;
};

// ── 3. 调用模型：无状态函数 f ─────────────────────────────────
async function callLLM(messages: Message[], tools: Tool[]): Promise<Message> {
  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages,
      // 工具声明随请求传入：模型据此决定调哪个、传什么参数
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

// ── 4. 核心循环 ──────────────────────────────────────────────
// 返回完整消息历史（而不只是最终答案），这样你能「看到」循环的每一步。
export async function runLoop(
  userRequest: string,
  tools: Tool[],
  options: LoopOptions = {},
): Promise<Message[]> {
  const maxTurns = options.maxTurns ?? 10;
  const messages: Message[] = [
    { role: "system", content: "你是一个助手，需要计算时调用 calculator 工具。" },
    { role: "user", content: userRequest },
  ];

  // ① 循环：反复调用 f，直到模型不再要求调工具，或达到轮数上限
  for (let turn = 0; turn < maxTurns; turn++) {
    const reply = await callLLM(messages, tools);
    messages.push(reply);

    // ② 判断：有工具调用吗？
    const toolCalls = reply.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return messages; // 没有 → 任务完成
    }

    // ③ 执行 + 回填：把工具结果追加进状态，下一轮模型就能「看到」
    for (const tc of toolCalls) {
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
      messages.push({ role: "tool", content: result, tool_call_id: tc.id });
    }
  }

  // 达到轮数上限仍未结束：返回当前状态（真实 harness 会在此触发熔断/报错）
  return messages;
}
