"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  ListChecks,
  Palmtree,
  Clock,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "홈",
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "구성원",
    items: [
      { href: "/employees", label: "직원 관리", icon: Users },
      { href: "/departments", label: "부서 관리", icon: Building2 },
      { href: "/organization", label: "조직도", icon: Network },
    ],
  },
  {
    label: "근태",
    items: [
      { href: "/attendance", label: "근태 현황", icon: Clock },
    ],
  },
  {
    label: "휴가",
    items: [
      { href: "/leave", label: "휴가 신청", icon: CalendarDays },
      { href: "/leave-types", label: "휴가 유형", icon: ListChecks },
      { href: "/balances", label: "잔여 휴가", icon: Palmtree },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r bg-white flex flex-col z-40">
      <div className="h-14 flex items-center px-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-bold tracking-tight">HR Manager</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 border-t">
        <p className="text-[11px] text-gray-400">HR Manager v2.0</p>
      </div>
    </aside>
  );
}
