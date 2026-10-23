/**
 * Step 03 · 上下文与压缩
 *
 * ── 根源：为什么需要「压缩」 ──
 *
 * step-01 推出：消息数组 = agent 的全部状态。
 * 但这条数组不能无限增长——上下文窗口有上限（几十万 token 封顶）。
 *
 * 塞太满会怎样？Anthropic 给了一个词：Context Rot（上下文腐烂）：
 *   窗口里的 token 越多，模型准确回忆其中信息的能力越下降。
 *
 * 所以上下文管理要回答一个问题：满了之后，丢掉什么、怎么丢？
 *
 * 最朴素的答案是「压缩」：
 *   把最早的一大段历史，替换成一段摘要。
 *   摘要保留了「关键信息」，丢弃了「细节」——用信息密度换空间。
 *
 * 于是压缩有两个核心参数：
 *   window —— 窗口上限（模型能装多少）
 *   buffer —— 预留余量（不贴着上限跑，给模型输出留空间）
 * 逼近 window - buffer 才触发压缩，这就是「何时压」。
 */

export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

// ── 1. 估算 token 数 ─────────────────────────────────────────
// 教学用简化：中文 1 字 ≈ 1 token，英文约 4 字符 ≈ 1 token。
// 真实实现用精确的 tokenizer，这里只为讲清「预算」的概念。
export function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => {
    const cjk = (m.content.match(/[\u4e00-\u9fff]/g) ?? []).length;
    const other = m.content.length - cjk;
    return sum + cjk + Math.ceil(other / 4);
  }, 0);
}

// ── 2. 压缩触发：逼近上限才压 ─────────────────────────────────
export function needsCompact(
  messages: Message[],
  window: number,
  buffer: number,
): boolean {
  return estimateTokens(messages) > window - buffer;
}

// ── 3. 压缩：摘要替换最早的历史 ───────────────────────────────
// 把最早的 `keepRecent` 条之前的消息，替换成一段摘要。
// 摘要由模型生成（这里传入 summarize 函数，教学环境可 mock）。
export async function compact(
  messages: Message[],
  summarize: (history: Message[]) => Promise<string>,
  keepRecent = 4,
): Promise<Message[]> {
  if (messages.length <= keepRecent) return messages;
  const history = messages.slice(0, -keepRecent);
  const summary = await summarize(history);
  return [
    { role: "system", content: "之前对话的摘要：" + summary },
    ...messages.slice(-keepRecent),
  ];
}
