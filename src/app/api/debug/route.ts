import { NextResponse } from "next/server";

export async function GET() {
  // 자동 주입되는 환경변수 확인
  const envKeys = Object.keys(process.env)
    .filter(
      (k) =>
        k.startsWith("APPHUB") ||
        k.startsWith("DATABASE") ||
        k.startsWith("DB_") ||
        k.startsWith("PG") ||
        k.startsWith("POSTGRES") ||
        k.startsWith("APP_") ||
        k.startsWith("API_") ||
        k.startsWith("INTERNAL") ||
        k.startsWith("SERVICE") ||
        k.startsWith("GW_") ||
        k.startsWith("GATEWAY")
    )
    .map((k) => ({
      key: k,
      // 값의 처음 10자만 보여주고 마스킹
      preview: (process.env[k] || "").substring(0, 10) + "...",
    }));

  return NextResponse.json({ envKeys, total: envKeys.length });
}
