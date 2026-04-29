import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEmployees } from "@/lib/api";

export interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "member";
  employeeId: string | null;
}

export async function getAuthUser(): Promise<AuthUser> {
  const h = await headers();
  const email = (h.get("x-apphub-user-email") || "").toLowerCase();
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
    name = email.split("@")[0] || "User";
  }

  // SSO 이메일로 직원 매칭 → role 결정
  let role: "admin" | "member" = "member";
  let employeeId: string | null = null;

  if (email) {
    try {
      const result = await getEmployees();
      const employees = result.rows || [];
      const matched = employees.find(
        (e: { email: string }) => e.email.toLowerCase() === email
      );
      if (matched) {
        employeeId = matched.id;
        role = matched.role === "admin" ? "admin" : "member";
        if (!name || name === "User") name = matched.name;
      }
    } catch {
      // API 실패 시 기본 member
    }
  }

  // 매칭 안 되면 admin으로 fallback (데모용)
  // 실제 운영 시 제거
  if (!employeeId) {
    role = "admin";
  }

  return {
    email,
    name: name || email.split("@")[0] || "User",
    role,
    employeeId,
  };
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
}
