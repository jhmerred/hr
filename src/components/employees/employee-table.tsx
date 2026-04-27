"use client";

import { useState } from "react";
import { Employee, Department } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import Link from "next/link";
import { deleteEmployeeAction } from "@/app/actions";

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: "재직", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  inactive: { label: "퇴직", cls: "text-gray-500 bg-gray-50 border-gray-200" },
  on_leave: { label: "휴직", cls: "text-amber-700 bg-amber-50 border-amber-200" },
};

const avatarColors = [
  "avatar-blue", "avatar-purple", "avatar-green", "avatar-amber", "avatar-rose", "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function EmployeeTable({
  employees,
  departments,
}: {
  employees: Employee[];
  departments: Department[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department_id === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="이름 또는 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 rounded-xl h-10 text-[13px]"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] bg-white text-gray-700 h-10"
        >
          <option value="">전체 부서</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left py-3 px-5">직원</th>
              <th className="text-left py-3 px-4">부서</th>
              <th className="text-left py-3 px-4">직책</th>
              <th className="text-left py-3 px-4">입사일</th>
              <th className="text-left py-3 px-4">상태</th>
              <th className="text-right py-3 px-5 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-[13px] text-gray-400 py-16"
                >
                  직원이 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const status = statusMap[emp.status] || statusMap.active;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-50 last:border-0 table-row-hover group"
                  >
                    <td className="py-3 px-5">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${getAvatarColor(emp.name)}`}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {emp.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-gray-600">
                      {deptMap.get(emp.department_id) || "-"}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-gray-600">
                      {emp.position}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-gray-500">
                      {emp.hire_date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] px-2 py-[3px] rounded-md border font-semibold ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={async () => {
                          if (confirm(`${emp.name}님을 삭제하시겠습니까?`)) {
                            await deleteEmployeeAction(emp.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
