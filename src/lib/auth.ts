import { headers } from "next/headers";

export interface AuthUser {
  email: string;
  name: string;
}

export async function getAuthUser(): Promise<AuthUser> {
  const h = await headers();
  const email = h.get("x-apphub-user-email") || "";
  const name = h.get("x-apphub-user-name") || email.split("@")[0] || "User";
  return { email, name };
}
