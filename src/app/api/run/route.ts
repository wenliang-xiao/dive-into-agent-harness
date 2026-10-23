import { runLoop, calculatorTool } from "@/lib/agent-loop";

/**
 * 交互式执行器后端：真实跑一遍核心循环，用 SSE 流式输出每一步 trace。
 * apiKey 由用户在前端配置，仅用于本次请求，不落盘、不记日志。
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { baseUrl, apiKey, model, request, maxTurns } = body ?? {};

  if (!request || typeof request !== "string") {
    return new Response(
      JSON.stringify({ error: "缺少请求内容 request" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: unknown) =>
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(e)}\n\n`),
        );
      try {
        await runLoop(
          request,
          [calculatorTool],
          { baseUrl, apiKey, model, maxTurns: maxTurns ?? 10 },
          send,
        );
      } catch (e) {
        send({
          type: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
