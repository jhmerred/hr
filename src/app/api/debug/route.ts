import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.APPHUB_API_KEY || "";
  const dataBaseUrl = process.env.APPHUB_DATA_BASE_URL || "";
  const slug = process.env.APPHUB_APP_SLUG || "";

  // SSO 프록시가 주입하는 모든 헤더
  const allHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key === "cookie") {
      // 쿠키 이름만 추출
      allHeaders[key] = value.split(";").map(c => c.trim().split("=")[0]).join(", ");
    } else {
      allHeaders[key] = value.length > 100 ? value.substring(0, 100) + "..." : value;
    }
  });

  // 모든 가능한 인증 방법으로 Gateway 호출 시도
  const results: Record<string, unknown>[] = [];
  const testUrl = `${dataBaseUrl}/${slug}/employees`;
  const cookie = request.headers.get("cookie") || "";

  // 1. 시스템 API 키
  try {
    const r = await fetch(testUrl, {
      headers: { "X-Api-Key": apiKey },
      redirect: "manual",
    });
    results.push({ method: "X-Api-Key", status: r.status, body: (await r.text()).substring(0, 200) });
  } catch (e) { results.push({ method: "X-Api-Key", error: String(e) }); }

  // 2. 쿠키 포워딩
  if (cookie) {
    try {
      const r = await fetch(testUrl, {
        headers: { "Cookie": cookie },
        redirect: "manual",
      });
      results.push({ method: "Cookie", status: r.status, body: (await r.text()).substring(0, 200) });
    } catch (e) { results.push({ method: "Cookie", error: String(e) }); }
  }

  // 3. X-Api-Key + Cookie 조합
  if (cookie) {
    try {
      const r = await fetch(testUrl, {
        headers: { "X-Api-Key": apiKey, "Cookie": cookie },
        redirect: "manual",
      });
      results.push({ method: "ApiKey+Cookie", status: r.status, body: (await r.text()).substring(0, 200) });
    } catch (e) { results.push({ method: "ApiKey+Cookie", error: String(e) }); }
  }

  // 4. Authorization Bearer with API key
  try {
    const r = await fetch(testUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
      redirect: "manual",
    });
    results.push({ method: "Bearer", status: r.status, body: (await r.text()).substring(0, 200) });
  } catch (e) { results.push({ method: "Bearer", error: String(e) }); }

  // 5. apphub 내부 서비스 URL 시도 (K8s 내부 통신)
  const internalUrls = [
    `http://apphub-sso/gw/${slug}/employees`,
    `http://apphub-sso.default.svc.cluster.local/gw/${slug}/employees`,
  ];
  for (const iUrl of internalUrls) {
    try {
      const r = await fetch(iUrl, {
        headers: { "X-Api-Key": apiKey },
        signal: AbortSignal.timeout(3000),
      });
      results.push({ method: `internal:${iUrl}`, status: r.status, body: (await r.text()).substring(0, 200) });
    } catch (e) { results.push({ method: `internal:${iUrl}`, error: String(e).substring(0, 100) }); }
  }

  return NextResponse.json({ testUrl, allHeaders, results });
}
