/**
 * Step 01 运行示例：让 agent 算一道数学题，并用 trace 打印循环的每一步。
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

// 用 onEvent 打印每一步 trace
await runLoop("帮我算一下 123 * 456 等于多少", [calculator], {}, (e) => {
  switch (e.type) {
    case "model_call":
      console.log(`\n[第 ${e.turn} 轮] 调用模型（喂入 ${e.messages.length} 条消息）`);
      break;
    case "model_reply":
      if (e.reply.tool_calls?.length) {
        const c = e.reply.tool_calls.map((tc) => `${tc.function.name}(${tc.function.arguments})`).join(", ");
        console.log(`        模型想调工具: ${c}`);
      } else {
        console.log(`        模型回答: ${e.reply.content}`);
      }
      break;
    case "tool_call":
      console.log(`        执行工具 ${e.name}(${e.args})`);
      break;
    case "tool_result":
      console.log(`        工具结果: ${e.result}`);
      break;
    case "done":
      console.log(`\n✅ 最终答案: ${e.answer}`);
      break;
    case "max_turns_reached":
      console.log("\n⚠️ 达到轮数上限，循环被截断");
      break;
  }
});
