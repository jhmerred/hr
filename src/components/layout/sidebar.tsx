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
  ChevronRight,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: null,
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
      { href: "/calendar", label: "캘린더", icon: Calendar },
      { href: "/leave", label: "휴가 관리", icon: CalendarDays },
      { href: "/leave-types", label: "휴가 유형", icon: ListChecks },
      { href: "/balances", label: "잔여 휴가", icon: Palmtree },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:shadow-blue-300 transition-shadow">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              HR Manager
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn("mb-1", group.label && "mt-5")}>
            {group.label && (
              <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full avatar-purple flex items-center justify-center text-[11px] font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-700 truncate">
              Admin
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              HR Manager v2.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
