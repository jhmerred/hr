import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // SSO 프록시가 주입하는 헤더 확인
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // 민감 정보 마스킹
    if (key.toLowerCase().includes("cookie")) {
      headers[key] = value.substring(0, 30) + "...(masked)";
    } else {
      headers[key] = value;
    }
  });

  // 환경변수 확인
  const apiKey = process.env.APPHUB_API_KEY || "";
  const dataBaseUrl = process.env.APPHUB_DATA_BASE_URL || "";
  const slug = process.env.APPHUB_APP_SLUG || "";

  // SSO 토큰으로 Gateway 호출 시도
  // SSO 프록시가 x-apphub-token 같은 헤더를 주입할 수 있음
  const ssoToken = request.headers.get("x-apphub-token")
    || request.headers.get("x-forwarded-access-token")
    || request.headers.get("x-auth-request-access-token")
    || request.headers.get("authorization")
    || "";

  let gatewayTest = null;
  if (dataBaseUrl) {
    // 시스템 키로 시도
    try {
      const res = await fetch(`${dataBaseUrl}/${slug}/employees`, {
        headers: { "X-Api-Key": apiKey, "X-App-Key": apiKey },
      });
      gatewayTest = {
        url: `${dataBaseUrl}/${slug}/employees`,
        method: "system-key",
        status: res.status,
        body: (await res.text()).substring(0, 200)
      };
    } catch (e) {
      gatewayTest = { error: String(e) };
    }

    // SSO 토큰으로 시도
    if (ssoToken && (!gatewayTest || gatewayTest.status !== 200)) {
      try {
        const res = await fetch(`${dataBaseUrl}/${slug}/employees`, {
          headers: { "Authorization": `Bearer ${ssoToken}` },
        });
        gatewayTest = {
          url: `${dataBaseUrl}/${slug}/employees`,
          method: "sso-token",
          status: res.status,
          body: (await res.text()).substring(0, 200)
        };
      } catch (e) {
        gatewayTest = { error: String(e) };
      }
    }

    // 쿠키 forwarding으로 시도
    const cookie = request.headers.get("cookie") || "";
    if (cookie && (!gatewayTest || gatewayTest.status !== 200)) {
      try {
        const res = await fetch(`${dataBaseUrl}/${slug}/employees`, {
          headers: { "Cookie": cookie },
        });
        gatewayTest = {
          url: `${dataBaseUrl}/${slug}/employees`,
          method: "cookie-forward",
          status: res.status,
          body: (await res.text()).substring(0, 300)
        };
      } catch (e) {
        gatewayTest = { error: String(e) };
      }
    }
  }

  return NextResponse.json({
    headers,
    ssoToken: ssoToken ? ssoToken.substring(0, 20) + "..." : "(none)",
    gatewayTest,
  });
}
