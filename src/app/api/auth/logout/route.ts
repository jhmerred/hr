import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/api/auth/login", process.env.APPHUB_APP_SLUG
    ? `https://jocodingax-ai-${process.env.APPHUB_APP_SLUG}.jocodingax.ai`
    : "http://localhost:3000"));

  res.cookies.delete("_mcp_token");
  res.cookies.delete("_mcp_refresh");

  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/api/auth/login", process.env.APPHUB_APP_SLUG
    ? `https://jocodingax-ai-${process.env.APPHUB_APP_SLUG}.jocodingax.ai`
    : "http://localhost:3000"));

  res.cookies.delete("_mcp_token");
  res.cookies.delete("_mcp_refresh");

  return res;
}
