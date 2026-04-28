import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API, 정적 파일은 건너뛰기
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("_mcp_token");
  const refreshToken = request.cookies.get("_mcp_refresh");

  // 토큰 없으면 로그인으로
  if (!token) {
    // refresh token이 있으면 갱신 시도
    if (refreshToken) {
      const refreshed = await tryRefreshToken(refreshToken.value, request);
      if (refreshed) return refreshed;
    }
    return NextResponse.redirect(new URL("/api/auth/login", request.url));
  }

  return NextResponse.next();
}

async function tryRefreshToken(
  refreshToken: string,
  request: NextRequest
): Promise<NextResponse | null> {
  const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";

  try {
    const res = await fetch(`${API_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.access_token) return null;

    // 새 토큰으로 쿠키 교체 후 원래 페이지로
    const response = NextResponse.next();
    response.cookies.set("_mcp_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: data.expires_in || 3600,
      path: "/",
    });
    if (data.refresh_token) {
      response.cookies.set("_mcp_refresh", data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 86400 * 30,
        path: "/",
      });
    }
    return response;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
