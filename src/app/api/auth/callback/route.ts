import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";
  const REDIRECT_URI = process.env.APPHUB_APP_SLUG
    ? `https://jocodingax-ai-${process.env.APPHUB_APP_SLUG}.jocodingax.ai/api/auth/callback`
    : "https://jocodingax-ai-hr.jocodingax.ai/api/auth/callback";

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const codeVerifier = request.cookies.get("_oauth_verifier")?.value;
  const savedState = request.cookies.get("_oauth_state")?.value;

  if (!code || !codeVerifier) {
    return NextResponse.json({ error: "Missing code or verifier" }, { status: 400 });
  }

  if (state !== savedState) {
    return NextResponse.json({ error: "State mismatch" }, { status: 400 });
  }

  // 토큰 교환
  const tokenRes = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", detail: text }, { status: 500 });
  }

  const tokenData = await tokenRes.json();

  // 토큰을 HTTP-only 쿠키에 저장
  const res = NextResponse.redirect(new URL("/dashboard", request.url));
  res.cookies.set("_mcp_token", tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: tokenData.expires_in || 3600,
    path: "/",
  });
  if (tokenData.refresh_token) {
    res.cookies.set("_mcp_refresh", tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 86400 * 30,
      path: "/",
    });
  }

  // 임시 쿠키 삭제
  res.cookies.delete("_oauth_verifier");
  res.cookies.delete("_oauth_state");

  return res;
}
