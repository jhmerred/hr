import { NextResponse } from "next/server";

export async function GET() {
  const dataBaseUrl = process.env.APPHUB_DATA_BASE_URL || "";
  const apiKey = process.env.APPHUB_API_KEY || "";
  const apiUrl = process.env.APPHUB_API_URL || "";
  const slug = process.env.APPHUB_APP_SLUG || "";

  // 다양한 URL 패턴을 시도해서 어떤 것이 작동하는지 확인
  const patterns = [
    { name: "DATA_BASE_URL/employees", url: `${dataBaseUrl}/employees` },
    { name: "DATA_BASE_URL/{slug}/employees", url: `${dataBaseUrl}/${slug}/employees` },
    { name: "API_URL/gw/{slug}/employees", url: `${apiUrl}/gw/${slug}/employees` },
    { name: "API_URL/gw/{slug}/data/employees", url: `${apiUrl}/gw/${slug}/data/employees` },
    { name: "API_URL/gw/{slug}/data/public-data/employees", url: `${apiUrl}/gw/${slug}/data/public-data/employees` },
    { name: "API_URL/internal/data/{slug}/employees", url: `${apiUrl}/internal/data/${slug}/employees` },
    { name: "API_URL/apps/85/data/employees", url: `${apiUrl}/apps/85/data/employees` },
    { name: "DATA_BASE_URL (raw)", url: dataBaseUrl },
  ];

  const results = [];
  for (const p of patterns) {
    try {
      const res = await fetch(p.url, {
        headers: { "X-Api-Key": apiKey, "X-App-Key": apiKey, "Content-Type": "application/json" },
      });
      const text = await res.text();
      results.push({ name: p.name, url: p.url, status: res.status, body: text.substring(0, 300) });
    } catch (e) {
      results.push({ name: p.name, url: p.url, error: String(e) });
    }
  }

  return NextResponse.json({
    env: { dataBaseUrl, apiUrl, slug, apiKeyPrefix: apiKey.substring(0, 15) },
    results,
  });
}
