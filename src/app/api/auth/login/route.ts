import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
  const REDIRECT_URI = process.env.APPHUB_APP_SLUG
    ? `https://jocodingax-ai-${process.env.APPHUB_APP_SLUG}.jocodingax.ai/api/auth/callback`
    : "https://jocodingax-ai-hr.jocodingax.ai/api/auth/callback";

  // PKCE
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = crypto.randomBytes(16).toString("base64url");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    scope: "read write",
    resource: `${API_BASE}/mcp`,
  });

  const res = NextResponse.redirect(`${API_BASE}/oauth/authorize?${params}`);
  // code_verifier를 쿠키에 저장 (callback에서 사용)
  res.cookies.set("_oauth_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  res.cookies.set("_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return res;
}
