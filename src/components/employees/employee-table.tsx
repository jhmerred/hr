"use client";

import { useState, useMemo } from "react";
import { Employee, Department } from "@/lib/types";
import { Trash2, Search, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { deleteEmployeeAction } from "@/app/actions";
import { EMPLOYEE_STATUS_STYLES, getInitial } from "@/lib/constants";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function EmployeeTable({
  employees,
  departments,
}: {
  employees: Employee[];
  departments: Department[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const toast = useToast();

  const deptMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q);
      const matchDept = !deptFilter || e.department_id === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, search, deptFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            placeholder="이름, 이메일, 직책 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none placeholder:text-gray-300"
          />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm bg-white appearance-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none"
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length}명</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {search || deptFilter ? "검색 결과가 없습니다" : "등록된 직원이 없습니다"}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {search || deptFilter
                ? "다른 검색어나 필터를 시도해 보세요"
                : "첫 번째 직원을 등록해 보세요"}
            </p>
            {!search && !deptFilter && (
              <Link
                href="/employees/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                직원 등록
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-5">직원</th>
                  <th className="text-left py-3 px-4">부서</th>
                  <th className="text-left py-3 px-4">직책</th>
                  <th className="text-left py-3 px-4">입사일</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const status = EMPLOYEE_STATUS_STYLES[emp.status] || EMPLOYEE_STATUS_STYLES.active;
                  const isDeleting = deleting === emp.id;
                  return (
                    <tr
                      key={emp.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-3 px-5">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                            {getInitial(emp.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {emp.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {emp.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                          {deptMap.get(emp.department_id) || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {emp.position}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 font-mono text-xs">
                        {emp.hire_date}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setDeleteTarget(emp);
                            }}
                            disabled={isDeleting}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                          >
                            {isDeleting ? (
                              <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                            )}
                          </button>
                          <Link
                            href={`/employees/${emp.id}`}
                            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            setDeleting(deleteTarget.id);
            await deleteEmployeeAction(deleteTarget.id);
            setDeleting(null);
            toast.success(`${deleteTarget.name}님이 삭제되었습니다`);
            setDeleteTarget(null);
          }
        }}
        title="직원 삭제"
        description={`${deleteTarget?.name}님을 삭제하시겠습니까? 관련 휴가/근태 데이터도 영향을 받을 수 있습니다.`}
        confirmLabel="삭제"
        variant="danger"
      />
    </div>
  );
}
