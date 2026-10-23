/**
 * Step 01 运行示例：让 agent 算一道数学题，并打印循环的每一步。
 *
 * 先配置 .env（复制 .env.example 填 key），然后：
 *   npm run step-01
 */
import { runLoop, type Tool } from "./agent.ts";

// 一个最简单的工具：计算器。
// 注意：真实产品绝不能用 eval 类做法，这里为聚焦「循环」而简化，
// 用白名单正则挡住任意代码执行。
const calculator: Tool = {
  name: "calculator",
  description: "计算数学表达式，例如 123*456",
  parameters: {
    type: "object",
    properties: {
      expression: { type: "string", description: "数学表达式" },
    },
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

const messages = await runLoop("帮我算一下 123 * 456 等于多少", [calculator]);

// 打印完整消息历史：你能看到循环的每一步
console.log("=== 消息历史（循环的每一步）===\n");
for (const m of messages) {
  if (m.role === "tool") {
    console.log(`[tool]  (调用 ${m.tool_call_id}) → ${m.content}`);
  } else if (m.tool_calls?.length) {
    const names = m.tool_calls.map((tc) => `${tc.function.name}(${tc.function.arguments})`).join(", ");
    console.log(`[assistant] 想调工具: ${names}`);
  } else {
    console.log(`[${m.role}] ${m.content}`);
  }
}
console.log("\n=== 最终答案 ===");
console.log(messages.at(-1)?.content);
