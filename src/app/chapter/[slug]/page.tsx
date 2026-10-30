import Link from "next/link";
import { notFound } from "next/navigation";
import { SelectionAnnotation } from "@/components/selection-annotation";
import {
  chapters,
  getAdjacent,
  getChapter,
} from "@content/manifest";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { default: Content } = await import(`@content/${slug}/page.mdx`);
  const { prev, next } = getAdjacent(slug);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 border-b border-line pb-6">
        <p className="text-sm text-muted">
          第 {chapter.order} 章 · 主案例 {chapter.mainCase}
          {chapter.compare.length > 0 && ` · 对照 ${chapter.compare.join(" / ")}`}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {chapter.title}
        </h1>
        <p className="mt-3 text-muted">{chapter.summary}</p>
      </header>

      <SelectionAnnotation slug={slug} chapterTitle={chapter.title}>
        <Content />
      </SelectionAnnotation>

      <nav className="mt-12 flex items-center justify-between border-t border-line pt-6">
        {prev ? (
          <Link
            href={`/chapter/${prev.slug}`}
            className="group max-w-[45%] text-sm"
          >
            <span className="block text-muted">← 上一章</span>
            <span className="text-accent group-hover:underline">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/chapter/${next.slug}`}
            className="group max-w-[45%] text-right text-sm"
          >
            <span className="block text-muted">下一章 →</span>
            <span className="text-accent group-hover:underline">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export const instant = false;
