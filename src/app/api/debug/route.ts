import { NextResponse } from "next/server";

export async function GET() {
  const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";

  const attempts = [
    {
      name: "client_credentials (minimal)",
      body: { grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET },
    },
    {
      name: "client_credentials + scope",
      body: { grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: "read write" },
    },
    {
      name: "client_credentials + redirect_uri",
      body: { grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: "https://jocodingax-ai-hr.jocodingax.ai/api/callback" },
    },
    {
      name: "client_credentials Basic auth",
      body: { grant_type: "client_credentials" },
      basicAuth: true,
    },
    {
      name: "client_credentials Basic + scope",
      body: { grant_type: "client_credentials", scope: "read write" },
      basicAuth: true,
    },
  ];

  const results = [];

  for (const attempt of attempts) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
      if (attempt.basicAuth) {
        headers["Authorization"] = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
      }
      const res = await fetch(`${API_BASE}/oauth/token`, {
        method: "POST",
        headers,
        body: new URLSearchParams(attempt.body as Record<string, string>),
      });
      const text = await res.text();
      results.push({
        name: attempt.name,
        status: res.status,
        body: text.substring(0, 300),
      });
    } catch (e) {
      results.push({ name: attempt.name, error: String(e) });
    }
  }

  return NextResponse.json({ results });
}
