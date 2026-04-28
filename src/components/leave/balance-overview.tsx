"use client";

import { useState } from "react";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { initializeBalancesAction } from "@/app/actions";
import { getInitial } from "@/lib/constants";

export function BalanceOverview({
  balances,
  employees,
  leaveTypes,
}: {
  balances: LeaveBalance[];
  employees: Employee[];
  leaveTypes: LeaveType[];
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const filtered = balances.filter((b) => b.year === year);

  const handleInitialize = async () => {
    if (!confirm(`${year}년 잔여 휴가를 초기화하시겠습니까?`)) return;
    setLoading(true);
    await initializeBalancesAction(year);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-9"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length}건</span>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitialize}
            disabled={loading}
            className="rounded-lg text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            {year}년 초기화
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
              <th className="text-left py-3 px-5">직원</th>
              <th className="text-left py-3 px-4">휴가 유형</th>
              <th className="text-left py-3 px-4">총 일수</th>
              <th className="text-left py-3 px-4">사용</th>
              <th className="text-left py-3 px-4">잔여</th>
              <th className="text-left py-3 px-4">소진율</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-sm text-gray-400 py-16">
                  {year}년 잔여 휴가 데이터가 없습니다. 초기화를 진행해 주세요.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const emp = empMap.get(b.employee_id);
                const empName = emp?.name || b.employee_id;
                const pct = b.total_days > 0 ? Math.round((b.used_days / b.total_days) * 100) : 0;
                const isLow = b.remaining_days <= 3;
                return (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {getInitial(empName)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{empName}</p>
                          <p className="text-xs text-gray-400">{emp?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                        {ltMap.get(b.leave_type_id) || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{b.total_days}일</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{b.used_days}일</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                        {b.remaining_days}일
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
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
