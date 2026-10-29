/**
 * Step 08 运行示例：跑一个循环，把它输出的 trajectory 序列化成 Canonical 格式。
 *
 * 先配置 .env（复制 .env.example 填 key），然后：
 *   npm run step-08
 *
 * 输出包含：thought-action-observation trace、final answer、turn count、
 * 和确切的 stop condition —— 这就是「可观测马尔可夫链」的完整样子，
 * 也是 RL 训练要吃的轨迹数据。
 */
import { collectTrajectory, type Trajectory } from "./trajectory.ts";
import type { Tool } from "../step-01-loop/agent.ts";

// 复用 step-01 的 calculator 工具（最小闭环）
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

const trajectory: Trajectory = await collectTrajectory(
  "帮我算一下 123 * 456 等于多少",
  [calculator],
);

// 打印轨迹（thought-action-observation 的每一步）
for (const msg of trajectory.messages) {
  if (msg.role === "assistant" && Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (block.type === "text" && block.text) console.log(`  回答: ${block.text}`);
      if (block.type === "toolCall") console.log(`  调工具: ${block.name}(${JSON.stringify(block.arguments)})`);
    }
  } else if (msg.role === "toolResult") {
    console.log(`  工具结果: ${String(msg.content).slice(0, 40)}`);
  }
}

// 轨迹的「可验证」三要素：turn count + stop condition + final answer
console.log(`\n── 轨迹三要素 ──`);
console.log(`turnCount: ${trajectory.turnCount}`);
console.log(`stopReason: ${trajectory.stopReason}`);
console.log(`finalAnswer: ${trajectory.finalAnswer}`);
