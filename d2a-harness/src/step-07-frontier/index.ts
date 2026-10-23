/**
 * Step 07 · 前沿与生产
 *
 * ── 根源：从「个人工具」到「基础设施」 ──
 *
 * 前面六章，我们都在写「一个单进程里的 agent」。但真实世界有
 * 两种更复杂的形态：
 *
 *   1. 多模态 —— 不只有文字，还有语音、图像。核心循环不变，
 *      只是「进出通道」换了（打字 → 说话）。
 *   2. 生产化 —— 从单进程，变成服务百万用户的分布式系统。
 *      核心循环不变，只是「拆开、放大」了。
 *
 * 两者的共同点是：核心循环（step-01）从没变过。
 * 前沿形态不是推翻骨架，而是两种「长大」方式。
 *
 * 本 step 展示「生产化」：把前面六章写在一个文件里的东西，
 * 拆成独立的模块——每个模块对应生产化 harness（如 corojaw）
 * 里的一个独立服务。
 */

/**
 * 模块化拆分：单文件 → 多模块
 *
 *   单文件（step-01~06）：
 *     agent.ts 里塞了 循环 + 工具 + 上下文 + 沙箱 ...
 *
 *   模块化（生产化）：
 *     loop.ts      —— 核心循环（第 1 章）
 *     tools.ts     —— 工具调用（第 2 章）
 *     context.ts   —— 上下文压缩（第 3 章）
 *     sandbox.ts   —— 权限钩子（第 4 章）
 *     index.ts     —— 组装
 *
 * 对照 corojaw 的模块：
 *   loop → corojaw-loop
 *   tools → corojaw-tool
 *   context → corojaw-context
 *   （生产化后，每个模块是独立服务，可独立扩展、部署）
 */

// 每个模块的「接口」——模块化后，模块间通过接口通信，而不是共享一个文件
export type LoopModule = {
  run: (request: string) => Promise<string>;
};

export type ToolsModule = {
  list: () => string[];
  execute: (name: string, args: unknown) => Promise<string>;
};

export type ContextModule = {
  estimateTokens: (messages: unknown[]) => number;
  compact: (messages: unknown[]) => Promise<unknown[]>;
};

export type SandboxModule = {
  check: (toolName: string, args: unknown) => { allow: boolean; reason?: string };
};

// 组装：一个生产化 harness = 各模块的组合
export type Harness = {
  loop: LoopModule;
  tools: ToolsModule;
  context: ContextModule;
  sandbox: SandboxModule;
};

export function createHarness(
  loop: LoopModule,
  tools: ToolsModule,
  context: ContextModule,
  sandbox: SandboxModule,
): Harness {
  return { loop, tools, context, sandbox };
}
