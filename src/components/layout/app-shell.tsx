"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { ToastProvider } from "@/components/toast";

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <span className="ml-3 font-bold text-sm text-gray-900">HR Manager</span>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile toggleable */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-[240px] min-h-screen pt-14 md:pt-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-7">
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}
