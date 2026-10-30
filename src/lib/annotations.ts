/**
 * 划线评论：类型、localStorage 存储、文本锚定工具。
 * 锚定采用 W3C TextQuoteSelector 简化版：quote + prefix + suffix。
 */

export type Annotation = {
  id: string;
  slug: string; // 章节 slug
  quote: string; // 选中文本
  prefix: string; // 选区前 50 字
  suffix: string; // 选区后 50 字
  comment: string; // 评审意见
  createdAt: string; // ISO
  issueUrl?: string; // 提交 GitHub issue 后的链接
};

const STORAGE_KEY = "d2a-annotations";

export function loadAnnotations(): Annotation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnnotation(a: Annotation): Annotation[] {
  const all = loadAnnotations().filter((x) => x.id !== a.id);
  const next = [...all, a];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeAnnotation(id: string): Annotation[] {
  const next = loadAnnotations().filter((x) => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function updateAnnotation(id: string, patch: Partial<Annotation>): Annotation[] {
  const next = loadAnnotations().map((x) => (x.id === id ? { ...x, ...patch } : x));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** 从选区 Range 提取锚定信息（quote + 前后文各 50 字） */
export function extractAnchor(range: Range): {
  quote: string;
  prefix: string;
  suffix: string;
} {
  const quote = range.toString();
  const root = range.commonAncestorContainer;
  const rootEl = root.nodeType === Node.TEXT_NODE ? root.parentElement : (root as Element);
  const fullText = (rootEl?.textContent ?? root.toString()).replace(/\s+/g, " ");
  const idx = fullText.indexOf(quote.replace(/\s+/g, " "));
  const start = idx < 0 ? 0 : Math.max(0, idx - 50);
  const end = idx < 0 ? fullText.length : Math.min(fullText.length, idx + quote.length + 50);
  return {
    quote,
    prefix: idx < 0 ? "" : fullText.slice(start, idx),
    suffix: idx < 0 ? "" : fullText.slice(idx + quote.length, end),
  };
}

/**
 * 在内容区内定位锚点，返回 Range（找不到返回 null）。
 * 用 quote + prefix/suffix 双重校验，避免误匹配。
 */
export function locateRange(
  container: HTMLElement,
  anchor: { quote: string; prefix: string; suffix: string },
): Range | null {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    { acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) },
  );

  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) textNodes.push(n as Text);

  // 拼接全文，用 offset 定位
  const parts: string[] = [];
  const nodeOffsets: { node: Text; start: number; end: number }[] = [];
  let cursor = 0;
  for (const node of textNodes) {
    const t = node.textContent ?? "";
    parts.push(t);
    nodeOffsets.push({ node, start: cursor, end: cursor + t.length });
    cursor += t.length;
  }
  const full = parts.join("");
  const q = anchor.quote.trim();
  const idx = full.indexOf(q);
  if (idx < 0) return null;

  // 校验前后文（宽松：至少一个能对上，或都不为空时看是否匹配）
  const before = full.slice(Math.max(0, idx - 50), idx);
  const after = full.slice(idx + q.length, idx + q.length + 50);
  const prefixOk = !anchor.prefix || anchor.prefix.slice(-20).trim() === before.slice(-20).trim();
  const suffixOk = !anchor.suffix || anchor.suffix.slice(0, 20).trim() === after.slice(0, 20).trim();
  if (!prefixOk && !suffixOk) return null;

  // 把全局 offset 映射回文本节点
  const startOffset = idx;
  const endOffset = idx + q.length;
  const startInfo = nodeOffsets.find((o) => startOffset >= o.start && startOffset < o.end);
  const endInfo = nodeOffsets.find((o) => endOffset > o.start && endOffset <= o.end);
  if (!startInfo || !endInfo) return null;

  const range = document.createRange();
  range.setStart(startInfo.node, startOffset - startInfo.start);
  range.setEnd(endInfo.node, endOffset - endInfo.start);
  return range;
}
