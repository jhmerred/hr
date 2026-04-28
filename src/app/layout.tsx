import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { getAuthUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "HR Manager",
  description: "직원 및 휴가 관리 시스템",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <AppShell userName={user.name} userEmail={user.email} userRole={user.role}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
