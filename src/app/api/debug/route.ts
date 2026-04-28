import { NextResponse } from "next/server";

export async function GET() {
  const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "(not set)";
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "(not set)";

  // 1. OAuth 토큰 발급 시도
  let tokenResult: Record<string, unknown> = {};
  let accessToken = "";
  try {
    const res = await fetch(`${API_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "read write",
        resource: `${API_BASE}/mcp`,
      }),
    });
    const text = await res.text();
    tokenResult = { status: res.status, body: text.substring(0, 500) };
    if (res.ok) {
      const data = JSON.parse(text);
      accessToken = data.access_token || "";
      tokenResult.tokenPrefix = accessToken.substring(0, 20) + "...";
    }
  } catch (e) {
    tokenResult = { error: String(e) };
  }

  // 2. 토큰으로 MCP 호출 시도
  let mcpResult: Record<string, unknown> = {};
  if (accessToken) {
    try {
      const res = await fetch(`${API_BASE}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "records",
            arguments: { app_slug: "hr", table_name: "employees", action: "query", per: 1 },
          },
          id: 1,
        }),
      });
      const text = await res.text();
      mcpResult = { status: res.status, body: text.substring(0, 500) };
    } catch (e) {
      mcpResult = { error: String(e) };
    }
  }

  return NextResponse.json({
    env: {
      API_BASE,
      CLIENT_ID: CLIENT_ID.substring(0, 10) + "...",
      CLIENT_SECRET_SET: CLIENT_SECRET !== "(not set)",
    },
    tokenResult,
    mcpResult,
  });
}
