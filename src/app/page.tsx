import Link from "next/link";
import { chapters } from "@content/manifest";

const focusLabel: Record<string, string> = {
  A: "演示代码",
  B: "源码精读",
  C: "动手实验",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <section className="mb-12 border-b border-line pb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">
          Dive into Agent Harness
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          动手学智能体框架
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          一本交互式学习网站，教你 <strong className="text-ink">agent harness</strong>
          ——把大模型变成 agent 的那层框架。方法论对标李沐《动手学深度学习》：
          可运行代码、由浅入深、边学边动手。
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <Link
            href="/chapter/intro"
            className="rounded-md bg-accent px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            开始阅读 →
          </Link>
          <a
            href="https://github.com/wenliang-xiao/dive-into-agent-harness"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line px-4 py-2 text-muted transition-colors hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">目录</h2>
        <ol className="space-y-3">
          {chapters.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/chapter/${c.slug}`}
                className="group flex items-baseline gap-4 rounded-lg border border-line bg-paper p-4 transition-colors hover:border-accent"
              >
                <span className="text-lg font-semibold text-muted tabular-nums">
                  {String(c.order).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="font-medium group-hover:text-accent">
                    {c.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {c.summary}
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted sm:block">
                  主案例 {c.mainCase}
                  {c.compare.length > 0 && ` · 对照 ${c.compare.join(" / ")}`}
                  <span className="ml-2 rounded bg-code-bg px-1.5 py-0.5">
                    {focusLabel[c.focus]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
