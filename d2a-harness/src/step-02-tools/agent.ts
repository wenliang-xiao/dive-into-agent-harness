/**
 * Step 02 · 工具调用
 *
 * ── 根源：为什么需要「工具声明 + 参数校验」 ──
 *
 * step-01 的循环里，我们只写了一句 `tool.execute(...)`。
 * 但「执行工具」这一环，其实藏着三个必须回答的问题：
 *
 *   1. 模型怎么知道「有哪些工具、各要什么参数」？
 *       → 工具声明（JSON Schema）。模型是看 Schema 来理解参数的，
 *         不是靠猜。所以声明必须结构化、可校验。
 *
 *   2. 模型给的参数能信吗？
 *       → 不能。模型输出是不可信的——它可能漏参数、给错类型、
 *         甚至被 prompt injection 塞进恶意参数。所以执行前必须校验。
 *
 *   3. 工具执行出错怎么办？
 *       → 不能崩。要把错误「封装成一条 tool 结果」回传给模型，
 *         让模型看到错误后自己纠正。循环不中断。
 *
 * 于是「执行工具」从一句，长成了四步：
 *   声明(Schema) → 解析参数 → 校验 → 执行 → 封装结果
 */

// ── 1. JSON Schema：工具声明的参数定义 ────────────────────────
// 模型靠它理解「这个工具要什么参数、什么类型、哪些必填」。
export type JsonSchema = {
  type: "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

export type Tool = {
  name: string;
  /** 声明给模型的名字（可改，用于实验） */
  declaredName?: string;
  description: string;
  parameters: JsonSchema;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

export type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

// ── 2. 参数校验：模型给的参数不可信 ────────────────────────────
// 三个检查：参数是合法 JSON 吗？必填字段在吗？类型对吗？
export function validateArguments(
  tool: Tool,
  rawArgs: Record<string, unknown>,
): { ok: true; args: Record<string, unknown> } | { ok: false; error: string } {
  const required = tool.parameters.required ?? [];
  for (const key of required) {
    if (!(key in rawArgs)) {
      return { ok: false, error: `缺少必填参数 ${key}` };
    }
  }
  for (const [key, spec] of Object.entries(tool.parameters.properties)) {
    const val = rawArgs[key];
    if (val === undefined) continue;
    const actual = Array.isArray(val) ? "array" : typeof val;
    if (spec.type !== actual) {
      return { ok: false, error: `参数 ${key} 应为 ${spec.type}，实际是 ${actual}` };
    }
  }
  return { ok: true, args: rawArgs };
}

// ── 3. 执行工具调用：声明→解析→校验→执行→封装 ─────────────────
// 每一步的错误都被「封装成一条 tool 结果」，而不是抛出异常崩掉循环。
export async function executeToolCall(
  tools: Tool[],
  tc: ToolCall,
): Promise<string> {
  // 找工具（用真实 name，而非 declaredName）
  const tool = tools.find((t) => t.name === tc.function.name);
  if (!tool) {
    return `错误：未知工具 ${tc.function.name}`;
  }

  // 解析参数
  let rawArgs: Record<string, unknown>;
  try {
    rawArgs = JSON.parse(tc.function.arguments);
  } catch {
    return `错误：参数不是合法 JSON`;
  }

  // 校验参数
  const validated = validateArguments(tool, rawArgs);
  if (!validated.ok) {
    return `错误：${validated.error}`;
  }

  // 执行
  try {
    return String(await tool.execute(validated.args));
  } catch (e) {
    return `错误：${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── 4. 调用模型（与 step-01 相同，但工具声明用 declaredName）───
async function callLLM(
  messages: Message[],
  tools: Tool[],
  config: { baseUrl?: string; apiKey?: string; model?: string },
): Promise<Message> {
  const base = (config.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.map((t) => ({
        type: "function",
        function: {
          name: t.declaredName ?? t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
    }),
  });
  if (!res.ok) throw new Error(`API 调用失败: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message;
}

// ── 5. 核心循环（复用 step-01，但执行工具换成了完整链路）──────
export async function runLoop(
  userRequest: string,
  tools: Tool[],
  config: { baseUrl?: string; apiKey?: string; model?: string; maxTurns?: number; systemPrompt?: string } = {},
  onEvent?: (e: unknown) => void,
): Promise<Message[]> {
  const maxTurns = config.maxTurns ?? 10;
  const messages: Message[] = [
    { role: "system", content: config.systemPrompt ?? "你是助手，需要计算时调用 calculator 工具。" },
    { role: "user", content: userRequest },
  ];

  for (let turn = 0; turn < maxTurns; turn++) {
    onEvent?.({ type: "model_call", turn, messages: [...messages] });
    const reply = await callLLM(messages, tools, config);
    onEvent?.({ type: "model_reply", turn, reply });
    messages.push(reply);

    const toolCalls = reply.tool_calls ?? [];
    if (toolCalls.length === 0) {
      onEvent?.({ type: "done", answer: reply.content });
      return messages;
    }

    for (const tc of toolCalls) {
      onEvent?.({ type: "tool_call", turn, name: tc.function.name, args: tc.function.arguments });
      const result = await executeToolCall(tools, tc); // ← 完整链路
      onEvent?.({ type: "tool_result", turn, result });
      messages.push({ role: "tool", content: result, tool_call_id: tc.id });
    }
  }

  onEvent?.({ type: "max_turns_reached" });
  return messages;
}
