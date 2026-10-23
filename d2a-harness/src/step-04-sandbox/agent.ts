/**
 * Step 04 · 沙箱与安全
 *
 * ── 根源：为什么「执行」需要护栏 ──
 *
 * 前面我们给 agent 装上了「执行工具」的手。但执行恰恰是 agent
 * 最强大、也最危险的地方：
 *
 *   1. 执行的命令有破坏性 —— 一句 rm -rf 就能删掉整个项目。
 *   2. 模型输出不可信 —— 它可能被 prompt injection 劫持，
 *      执行攻击者注入的恶意命令。
 *
 * 所以 harness 必须回答：给 agent 手脚之后，怎么给它护栏？
 * 答案是三道防线：隔离（限定破坏范围）、权限（能做什么）、
 * 审批（危险操作要人确认）。
 *
 * 本章实现最通用的一环：执行前的「权限钩子」。
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
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

// ── 权限检查：执行前的一道闸门 ────────────────────────────────
// 输入「要执行什么 + 什么参数」，输出「允不允许 + 为什么」。
// 这是审批流/权限检查的落点：真实 harness 在这里 block 危险操作。
export type PermissionCheck = (
  toolName: string,
  args: Record<string, unknown>,
) => { allow: boolean; reason?: string };

// ── 执行工具（带权限钩子）────────────────────────────────────
// 关键设计：拦截不是崩溃，而是「返回一条错误结果」回传给模型。
// 模型看到「被拦截」后，可以调整策略（换一种不危险的做法）。
export async function executeToolCall(
  tools: Tool[],
  tc: ToolCall,
  permission: PermissionCheck,
): Promise<string> {
  const tool = tools.find((t) => t.name === tc.function.name);
  if (!tool) return `错误：未知工具 ${tc.function.name}`;

  let args: Record<string, unknown>;
  try {
    args = JSON.parse(tc.function.arguments);
  } catch {
    return `错误：参数不是合法 JSON`;
  }

  // ① 执行前，先过权限闸门
  const verdict = permission(tc.function.name, args);
  if (!verdict.allow) {
    return `被拦截：${verdict.reason ?? "需要审批"}`; // ② block：返回错误，不执行
  }

  // ③ 放行：真正执行
  try {
    return String(await tool.execute(args));
  } catch (e) {
    return `错误：${e instanceof Error ? e.message : String(e)}`;
  }
}
