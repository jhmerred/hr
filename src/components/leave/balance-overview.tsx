"use client";

import { useState, useMemo } from "react";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import { RefreshCw, Search, Palmtree } from "lucide-react";
import { initializeBalancesAction } from "@/app/actions";
import { getInitial } from "@/lib/constants";
import { useToast } from "@/components/toast";

export function BalanceOverview({
  balances,
  employees,
  leaveTypes,
  canInitialize = true,
}: {
  balances: LeaveBalance[];
  employees: Employee[];
  leaveTypes: LeaveType[];
  canInitialize?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const ltMap = useMemo(() => new Map(leaveTypes.map((lt) => [lt.id, lt.name])), [leaveTypes]);

  const filtered = useMemo(() => {
    const yearFiltered = balances.filter((b) => b.year === year);
    if (!search.trim()) return yearFiltered;
    const q = search.toLowerCase();
    return yearFiltered.filter((b) => {
      const emp = empMap.get(b.employee_id);
      return (
        emp?.name.toLowerCase().includes(q) ||
        emp?.position?.toLowerCase().includes(q) ||
        ltMap.get(b.leave_type_id)?.toLowerCase().includes(q)
      );
    });
  }, [balances, year, search, empMap, ltMap]);

  const handleInitialize = async () => {
    if (!confirm(`${year}년 잔여 휴가를 초기화하시겠습니까?\n모든 직원에게 기본 일수가 부여됩니다.`)) return;
    setLoading(true);
    await initializeBalancesAction(year);
    setLoading(false);
    toast.success(`${year}년 잔여 휴가가 초기화되었습니다`);
  };

  // Summary stats
  const totalEmployees = new Set(filtered.map((b) => b.employee_id)).size;
  const totalUsed = filtered.reduce((s, b) => s + b.used_days, 0);
  const totalRemaining = filtered.reduce((s, b) => s + b.remaining_days, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm bg-white font-semibold appearance-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="직원, 유형 검색..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none placeholder:text-gray-300"
          />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
            <span>{totalEmployees}명</span>
            <span>사용 {totalUsed}일</span>
            <span>잔여 {totalRemaining}일</span>
          </div>
          {canInitialize && (
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {year}년 초기화
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Palmtree className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {year}년 잔여 휴가 데이터가 없습니다
            </p>
            <p className="text-xs text-gray-400 mb-4">
              초기화를 실행하면 모든 직원에게 기본 일수가 부여됩니다
            </p>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {year}년 초기화
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-5">직원</th>
                  <th className="text-left py-3 px-4">휴가 유형</th>
                  <th className="text-center py-3 px-4">총 일수</th>
                  <th className="text-center py-3 px-4">사용</th>
                  <th className="text-center py-3 px-4">잔여</th>
                  <th className="text-left py-3 px-4 w-36">소진율</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const emp = empMap.get(b.employee_id);
                  const empName = emp?.name || "-";
                  const pct = b.total_days > 0 ? Math.round((b.used_days / b.total_days) * 100) : 0;
                  const isLow = b.remaining_days <= 3 && b.remaining_days > 0;
                  const isEmpty = b.remaining_days === 0 && b.total_days > 0;
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {getInitial(empName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{empName}</p>
                            <p className="text-xs text-gray-400">{emp?.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                          {ltMap.get(b.leave_type_id) || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{b.total_days}일</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{b.used_days}일</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-sm font-bold ${
                          isEmpty ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"
                        }`}>
                          {b.remaining_days}일
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-8 text-right ${
                            pct >= 80 ? "text-red-600" : pct >= 50 ? "text-amber-600" : "text-gray-500"
                          }`}>
                            {pct}%
                          </span>
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
    </div>
  );
}
