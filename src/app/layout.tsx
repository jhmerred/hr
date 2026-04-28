import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
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
      <body className="min-h-full flex bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <Sidebar userName={user.name} userEmail={user.email} />
        <main className="flex-1 ml-[240px] min-h-screen">
          <div className="max-w-[1200px] mx-auto px-8 py-7">{children}</div>
        </main>
      </body>
    </html>
  );
}
