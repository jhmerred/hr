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
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  memberOnly?: boolean;
}

const navGroups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "구성원",
    items: [
      { href: "/profile", label: "내 프로필", icon: UserCircle, memberOnly: true },
      { href: "/employees", label: "직원 관리", icon: Users, adminOnly: true },
      { href: "/departments", label: "부서 관리", icon: Building2, adminOnly: true },
      { href: "/organization", label: "조직도", icon: Network, adminOnly: true },
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
      { href: "/leave-types", label: "휴가 유형", icon: ListChecks, adminOnly: true },
      { href: "/balances", label: "잔여 휴가", icon: Palmtree },
    ],
  },
];

export function Sidebar({
  userName,
  userEmail,
  userRole = "member",
  onNavigate,
}: {
  userName: string;
  userEmail: string;
  userRole?: "admin" | "member";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/orbit-logo.svg" alt="Orbit" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-bold tracking-tight text-gray-900">
            HR
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly && userRole !== "admin") return false;
            if (item.memberOnly && userRole !== "member") return false;
            return true;
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className={cn("mb-1", group.label && "mt-5")}>
              {group.label && (
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                      strokeWidth={isActive ? 2 : 1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {userRole === "admin" ? "관리자" : "직원"}
            </p>
          </div>
          <a
            href="/api/auth/logout"
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="로그아웃"
          >
            <LogOut className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
