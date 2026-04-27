import { NextResponse } from "next/server";

export async function GET() {
  const keys = [
    "APPHUB_API_KEY",
    "APPHUB_API_URL",
    "APPHUB_APP_ID",
    "APPHUB_APP_SLUG",
    "APPHUB_DATA_BASE_URL",
  ];

  const vars = keys.map((k) => ({
    key: k,
    value: process.env[k] || "(not set)",
  }));

  // APPHUB_DATA_BASE_URL로 employees 데이터 가져오기 테스트
  const dataBaseUrl = process.env.APPHUB_DATA_BASE_URL || "";
  const apiKey = process.env.APPHUB_API_KEY || "";

  let testResult = null;
  if (dataBaseUrl && apiKey) {
    try {
      // 테이블 목록이나 직원 데이터 가져오기 시도
      const testUrls = [
        `${dataBaseUrl}/employees`,
        `${dataBaseUrl}/tables/employees`,
        `${dataBaseUrl}/data/employees`,
      ];

      for (const url of testUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              "X-Api-Key": apiKey,
              "X-App-Key": apiKey,
              "Content-Type": "application/json",
            },
          });
          const text = await res.text();
          testResult = { url, status: res.status, body: text.substring(0, 500) };
          if (res.ok) break;
        } catch (e) {
          testResult = { url, error: String(e) };
        }
      }
    } catch (e) {
      testResult = { error: String(e) };
    }
  }

  return NextResponse.json({ vars, testResult });
}
