"use client";

import { useState } from "react";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { initializeBalancesAction } from "@/app/actions";

const avatarColors = [
  "avatar-blue", "avatar-purple", "avatar-green", "avatar-amber", "avatar-rose", "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

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
          className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] bg-white h-9"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <span className="text-[12px] text-gray-400">{filtered.length}건</span>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitialize}
            disabled={loading}
            className="rounded-xl text-[12px] h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            {year}년 초기화
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
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
                <td colSpan={6} className="text-center text-[13px] text-gray-400 py-16">
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
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 table-row-hover">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${getAvatarColor(empName)}`}>
                          {empName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-gray-800">{empName}</p>
                          <p className="text-[10px] text-gray-400">{emp?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-[2px] rounded-md">
                        {ltMap.get(b.leave_type_id) || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{b.total_days}일</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{b.used_days}일</td>
                    <td className="py-3 px-4">
                      <span className={`text-[13px] font-bold ${isLow ? "text-rose-600" : "text-gray-900"}`}>
                        {b.remaining_days}일
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 80 ? "bg-rose-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">{pct}%</span>
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
