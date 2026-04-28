import { headers } from "next/headers";

export interface AuthUser {
  email: string;
  name: string;
}

export async function getAuthUser(): Promise<AuthUser> {
  const h = await headers();
  const email = h.get("x-apphub-user-email") || "";
  const rawName = h.get("x-apphub-user-name") || "";

  // SSO 프록시가 한글을 Latin1로 인코딩하는 경우 UTF-8로 디코딩
  let name = rawName;
  try {
    const bytes = new Uint8Array(
      [...rawName].map((c) => c.charCodeAt(0))
    );
    const decoded = new TextDecoder("utf-8").decode(bytes);
    if (decoded && !decoded.includes("�")) {
      name = decoded;
    }
  } catch {
    // 디코딩 실패 시 원본 사용
  }

  if (!name || name === rawName && /[^\x00-\x7F]/.test(rawName) && rawName.includes("ì")) {
    // 여전히 깨진 경우 이메일에서 추출
    name = email.split("@")[0] || "User";
  }

  return { email, name: name || email.split("@")[0] || "User" };
}
