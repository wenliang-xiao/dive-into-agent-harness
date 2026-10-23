import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/** 从 diagrams/ 目录 serve archify 产物（供 iframe 承载） */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const rel = segments.join("/");
  if (!/^[a-z0-9/._-]+\.html$/i.test(rel)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const full = path.join(process.cwd(), "diagrams", rel);
  try {
    const content = await readFile(full, "utf-8");
    return new NextResponse(content, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
