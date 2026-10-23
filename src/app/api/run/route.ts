import { runLoop, calculatorTool, type Tool } from "@/lib/agent-loop";

/**
 * 实验执行器后端：真实跑一遍核心循环，SSE 流式输出 trace。
 * 支持可编辑参数：systemPrompt / toolName（拼错工具名实验）/ maxTurns。
 * apiKey 由用户在前端全局配置，仅用于本次请求，不落盘、不记日志。
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { baseUrl, apiKey, model, request, systemPrompt, toolName, maxTurns } =
    body ?? {};

  if (!request || typeof request !== "string") {
    return new Response(JSON.stringify({ error: "缺少请求内容 request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 工具：执行查找名固定 calculator；declaredName 用 toolName（实验 3：拼错后模型调不到，观察错误兜住）
  const tools: Tool[] = [
    toolName
      ? { ...calculatorTool, declaredName: toolName }
      : calculatorTool,
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: unknown) =>
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(e)}\n\n`),
        );
      try {
        await runLoop(
          request,
          tools,
          { baseUrl, apiKey, model, systemPrompt, maxTurns: maxTurns ?? 10 },
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
