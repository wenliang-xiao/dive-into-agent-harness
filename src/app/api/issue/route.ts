/**
 * 提交 GitHub issue：评审意见沉淀到仓库。
 * 凭据走环境变量（GITHUB_TOKEN / REVIEW_SECRET），绝不进前端或 git。
 */

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { secret, title, body: issueBody } = body ?? {};

  const expectedSecret = process.env.REVIEW_SECRET;
  const token = process.env.GITHUB_TOKEN;

  if (!expectedSecret || !token) {
    return new Response(
      JSON.stringify({ error: "服务端未配置 REVIEW_SECRET / GITHUB_TOKEN" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!secret || secret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "评审口令错误" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!title || !issueBody) {
    return new Response(JSON.stringify({ error: "缺少 title / body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const repo = process.env.GITHUB_REPO ?? "wenliang-xiao/dive-into-agent-harness";
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "d2a-annotation",
      },
      body: JSON.stringify({ title, body: issueBody }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.message ?? `GitHub API ${res.status}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ html_url: data.html_url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
