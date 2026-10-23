/**
 * Step 06 · 评测与可观测
 *
 * ── 根源：为什么 harness 需要评测 ──
 *
 * harness 是基础设施。你改了核心循环、上下文压缩、会话存储——
 * 怎么知道没把性能改坏？
 *
 * 一个会话列表加载从 200ms 变成 2s，单个用户只觉得「有点卡」，
 * 放大到百万用户就是灾难。评测（benchmark）回答的正是这个问题：
 *   给 harness 建立一套「体检」机制，性能回退能被量化发现，
 *   而不是靠用户投诉。
 *
 * 注意区分：这里测的是 harness 本身（循环、会话、IO 快不快），
 * 不是「模型聪不聪明」——那是另一个领域。
 *
 * 三个核心原则：
 *   1. 按用户路径组织 —— 测用户感知的操作，不是内部函数。
 *   2. 合成输入可复现 —— 用固定数据，每次跑都一样，能稳定对比。
 *   3. 预算断言防回退 —— 超预算就失败，性能回退立刻暴露。
 */

/** 计时端点：跑一次被测的「用户路径」 */
export type TimedFn = () => Promise<unknown>;

export type BenchmarkResult = {
  samples: number[];
  median: number;
  budget: number;
  pass: boolean;
};

// ── 计时：多次采样取中位数 ───────────────────────────────────
// 单次耗时抖动大，中位数更稳。
export async function benchmark(
  fn: TimedFn,
  samples = 5,
  budget = 200,
): Promise<BenchmarkResult> {
  const timings: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    await fn();
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  const median = timings[Math.floor(timings.length / 2)];
  return { samples: timings, median, budget, pass: median < budget };
}
