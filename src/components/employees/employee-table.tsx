"use client";

import { useState } from "react";
import { Employee, Department } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import Link from "next/link";
import { deleteEmployeeAction } from "@/app/actions";
import { EMPLOYEE_STATUS_STYLES, getInitial } from "@/lib/constants";

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
            className="pl-9 bg-white border-gray-200 rounded-lg h-10 text-sm"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 h-10"
        >
          <option value="">전체 부서</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
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
                  className="text-center text-sm text-gray-400 py-16"
                >
                  직원이 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const status = EMPLOYEE_STATUS_STYLES[emp.status] || EMPLOYEE_STATUS_STYLES.active;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {getInitial(emp.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {emp.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {deptMap.get(emp.department_id) || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {emp.position}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {emp.hire_date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-semibold ${status.cls}`}
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
