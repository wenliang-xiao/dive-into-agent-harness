/**
 * web 运行时版核心循环（与 d2a-harness/src/step-01-loop/agent.ts 逻辑一致）。
 * 供 /api/run 在服务端真实执行，向网页流式输出 trace。
 */

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

export type Tool = {
  /** 执行查找名（内部真实名字） */
  name: string;
  /** 声明给模型的名字（可改，实验 3：拼错这个名字触发「未知工具」） */
  declaredName?: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

export type RunConfig = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  maxTurns?: number;
  /** 可编辑：系统提示（实验 2 删掉「调用 calculator」观察行为） */
  systemPrompt?: string;
  /** 窗口上限（token），超出触发压缩 */
  maxTokens?: number;
  /** 预留余量 */
  buffer?: number;
  /** 压缩时保留最近几条 */
  keepRecent?: number;
};

export type TraceEvent =
  | { type: "model_call"; turn: number; messages: Message[] }
  | { type: "model_reply"; turn: number; reply: Message }
  | { type: "tool_call"; turn: number; name: string; args: string }
  | { type: "tool_result"; turn: number; result: string }
  | { type: "compact"; turn: number; tokens: number; window: number; dropped: number }
  | { type: "done"; answer: string }
  | { type: "max_turns_reached" };

/** 估算 token（教学简化：中文 1 字 1 token，其余 4 字符 1 token） */
export function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => {
    const cjk = (m.content.match(/[\u4e00-\u9fff]/g) ?? []).length;
    const other = m.content.length - cjk;
    return sum + cjk + Math.ceil(other / 4);
  }, 0);
}

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
        function: { name: t.declaredName ?? t.name, description: t.description, parameters: t.parameters },
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`API 调用失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices[0].message;
}

export async function runLoop(
  userRequest: string,
  tools: Tool[],
  config: RunConfig = {},
  onEvent?: (e: TraceEvent) => void,
): Promise<Message[]> {
  const maxTurns = config.maxTurns ?? 10;
  const systemPrompt = config.systemPrompt ?? "你是一个助手，需要计算时调用 calculator 工具。";
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userRequest },
  ];

  for (let turn = 0; turn < maxTurns; turn++) {
    // 压缩触发：token 逼近上限，把最早的消息截断（教学简化版压缩）
    if (config.maxTokens) {
      const window = config.maxTokens;
      const buffer = config.buffer ?? 0;
      if (estimateTokens(messages) > window - buffer) {
        const keepRecent = config.keepRecent ?? 4;
        const dropped = Math.max(0, messages.length - keepRecent);
        if (dropped > 0) {
          const kept = messages.slice(-keepRecent);
          messages.length = 0;
          messages.push({
            role: "system",
            content: `（已压缩 ${dropped} 条历史消息，只保留摘要和最近 ${keepRecent} 条）`,
          });
          messages.push(...kept);
          onEvent?.({
            type: "compact",
            turn,
            tokens: estimateTokens(messages),
            window,
            dropped,
          });
        }
      }
    }

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

/** 教学用工具：计算器（白名单正则防注入） */
export const calculatorTool: Tool = {
  name: "calculator",
  description: "计算数学表达式，例如 123*456",
  parameters: {
    type: "object",
    properties: { expression: { type: "string", description: "数学表达式" } },
    required: ["expression"],
  },
  execute: async (args) => {
    const expr = String(args.expression);
    if (!/^[0-9+\-*/%().\s]+$/.test(expr)) return `非法表达式：${expr}`;
    try {
      return String(Function(`"use strict"; return (${expr})`)());
    } catch {
      return `计算错误：${expr}`;
    }
  },
};
