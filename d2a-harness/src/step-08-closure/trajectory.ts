/**
 * Step 08 · 训练与部署闭环
 *
 * ── 根源：harness 的 trajectory 输出，是 RL 训练的数据生产 ──
 *
 * 前面七章都在回答「harness 怎么让模型干活」。这一章反过来问：
 *   干活的过程（trajectory）本身值不值钱？
 *
 * 值钱。agent 的每一步 —— 观察状态、决定动作、拿到结果 —— 是一条
 * 可观测的马尔可夫链：
 *
 *     state(消息数组) -> action(工具调用) -> observation(工具结果)
 *
 * 这条链就是 RL 训练（GRPO / PPO）要的「轨迹数据」：训练下一代
 * agent 模型，喂的就是这些（状态，动作，结果，奖励）的采样序列。
 *
 * 所以 harness 的「可观测」不只是 debug 用的 —— 它是【数据生产】。
 * 把循环产生的消息流，序列化成结构化的 trajectory，就是这一章
 * 从零实现的能力。
 *
 * 关键结论（为什么序列化格式要「固定」）：
 *   1. 结构化才能复现 —— 评测（第 6 章）要「这次和上次比」。
 *   2. 结构化才能当训练数据 —— RL 要成对的（状态，动作，奖励）。
 *   3. 结构化才能跨 harness 对齐 —— 不同 harness 产出的轨迹
 *      能放进同一个评测集 / 训练集（AgentEval 的 Canonical 格式）。
 */

import { runLoop, type Message, type Tool, type TraceEvent, type RunConfig } from "../step-01-loop/agent.ts";

// ── 1. Canonical 轨迹类型（对齐 AgentEval 格式）─────────────────
// 一条 trajectory = 一个消息数组。四种 role，三种内容块。
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | { type: "toolCall"; id: string; name: string; arguments: Record<string, unknown> };

export type CanonicalMessage = {
  role: "system" | "user" | "assistant" | "toolResult";
  /** assistant 用内容块数组，toolResult 用扁平字符串 */
  content: ContentBlock[] | string;
  /** toolResult 专用：关联回 assistant 里的 toolCall id */
  toolCallId?: string;
  toolName?: string;
  isError?: boolean;
  metadata: {
    roundIndex: number;
    /** 模型停止原因：toolUse（继续调工具）/ endTurn（答完了）/ maxTokens（截断） */
    stopReason?: "toolUse" | "endTurn" | "maxTokens";
  };
};

export type Trajectory = {
  messages: CanonicalMessage[];
  /** 轮数：循环转了几圈（等价于 assistant 消息条数） */
  turnCount: number;
  /** 确切的停止条件：这是轨迹可复现的关键 */
  stopReason: "endTurn" | "maxTokens";
  finalAnswer: string;
};

// ── 2. 序列化：把循环产生的消息流，转成 Canonical trajectory ───
// 核心洞察：harness 循环本来就在维护一个消息数组（第 1 章）。
// 序列化不是「额外记录」，而是把这个数组翻译成跨 harness 对齐的格式。
export function serializeTrajectory(
  messages: Message[],
  events: TraceEvent[],
): Trajectory {
  // 轮数 = 循环转了几圈 = assistant 消息条数
  const turnCount = messages.filter((m) => m.role === "assistant").length;

  const canon: CanonicalMessage[] = messages.map((m) => {
    // assistant 消息：拆成 text 块 + toolCall 块
    if (m.role === "assistant") {
      const blocks: ContentBlock[] = [];
      if (m.content) blocks.push({ type: "text", text: m.content });
      for (const tc of m.tool_calls ?? []) {
        blocks.push({
          type: "toolCall",
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || "{}"),
        });
      }
      // stopReason：有工具调用 = toolUse（还要继续），没有 = endTurn（答完了）
      const stopReason: "toolUse" | "endTurn" =
        (m.tool_calls?.length ?? 0) > 0 ? "toolUse" : "endTurn";
      return {
        role: "assistant",
        content: blocks,
        metadata: { roundIndex: 0, stopReason },
      };
    }

    // tool 消息：扁平结构，关联回 toolCall
    if (m.role === "tool") {
      return {
        role: "toolResult",
        content: m.content,
        toolCallId: m.tool_call_id,
        metadata: { roundIndex: 0 },
      };
    }

    // system / user：text 块
    return {
      role: m.role,
      content: [{ type: "text", text: m.content }],
      metadata: { roundIndex: 0 },
    };
  });

  // 确切的停止条件：从 trace 事件里找 done / max_turns_reached
  const stopped = events.some((e) => e.type === "max_turns_reached");
  const done = events.find((e) => e.type === "done");
  const stopReason: "endTurn" | "maxTokens" = stopped ? "maxTokens" : "endTurn";
  const finalAnswer = done && done.type === "done" ? done.answer : "";

  return { messages: canon, turnCount, stopReason, finalAnswer };
}

// ── 3. 采集：跑一个循环，同时采集轨迹 ─────────────────────────
export async function collectTrajectory(
  request: string,
  tools: Tool[],
  config: RunConfig = {},
): Promise<Trajectory> {
  const events: TraceEvent[] = [];
  const messages = await runLoop(request, tools, config, (e) => events.push(e));
  return serializeTrajectory(messages, events);
}
