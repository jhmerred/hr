import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 모든 APPHUB 관련 환경변수 (전체 값)
  const apphubVars: Record<string, string> = {};
  const dbVars: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (key.startsWith("APPHUB")) {
      // API_KEY는 앞 20자만
      apphubVars[key] = key.includes("KEY") ? value.substring(0, 20) + "..." : value;
    }
    if (key.includes("DATABASE") || key.includes("DB_") || key.includes("PG") || key.includes("POSTGRES") || key.includes("REDIS") || key.includes("MONGO")) {
      dbVars[key] = value.substring(0, 30) + "...";
    }
  }

  // SSO 프록시 주입 헤더
  const ssoHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key.startsWith("x-") || key === "authorization" || key === "cookie") {
      ssoHeaders[key] = key === "cookie" ? value.substring(0, 50) + "..." : value;
    }
  });

  // 쿠키로 Gateway 접근 시도
  const cookie = request.headers.get("cookie") || "";
  let cookieGatewayTest = null;
  if (cookie) {
    try {
      const res = await fetch("https://hub-api.jocodingax.ai/gw/hr/employees", {
        headers: { "Cookie": cookie },
        redirect: "manual",
      });
      const body = await res.text();
      cookieGatewayTest = { status: res.status, body: body.substring(0, 300) };
    } catch (e) {
      cookieGatewayTest = { error: String(e) };
    }
  }

  return NextResponse.json({ apphubVars, dbVars, ssoHeaders, cookieGatewayTest });
}
