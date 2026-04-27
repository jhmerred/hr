"use client";

import { useState, useMemo } from "react";
import { AttendanceRecord, Employee, Department } from "@/lib/types";
import { Clock, TrendingUp, AlertTriangle, CalendarDays } from "lucide-react";

const statusLabel: Record<string, string> = {
  normal: "정상",
  late: "지각",
  early_leave: "조퇴",
  overtime: "초과근무",
  leave: "휴가",
  absent: "결근",
};
const statusColor: Record<string, string> = {
  normal: "text-emerald-700 bg-emerald-50 border-emerald-200",
  late: "text-orange-700 bg-orange-50 border-orange-200",
  early_leave: "text-yellow-700 bg-yellow-50 border-yellow-200",
  overtime: "text-rose-700 bg-rose-50 border-rose-200",
  leave: "text-blue-700 bg-blue-50 border-blue-200",
  absent: "text-gray-600 bg-gray-100 border-gray-200",
};

const avatarColors = [
  "avatar-blue", "avatar-purple", "avatar-green", "avatar-amber", "avatar-rose", "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function AttendanceDashboard({
  records,
  employees,
  departments,
}: {
  records: AttendanceRecord[];
  employees: Employee[];
  departments: Department[];
}) {
  const [deptFilter, setDeptFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const deptMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const emp = empMap.get(r.employee_id);
      const matchDept = !deptFilter || emp?.department_id === deptFilter;
      const matchDate = !dateFilter || r.date === dateFilter;
      return matchDept && matchDate;
    });
  }, [records, deptFilter, dateFilter, empMap]);

  const totalWorkMin = filtered.reduce((s, r) => s + (r.work_minutes || 0), 0);
  const totalOvertimeMin = filtered.reduce((s, r) => s + (r.overtime_minutes || 0), 0);
  const lateCount = filtered.filter((r) => r.status === "late").length;
  const leaveCount = filtered.filter((r) => r.status === "leave").length;

  // 52시간 경고
  const weeklyHours = new Map<string, number>();
  records.forEach((r) => {
    const current = weeklyHours.get(r.employee_id) || 0;
    weeklyHours.set(r.employee_id, current + (r.work_minutes || 0));
  });
  const overWorkers = Array.from(weeklyHours.entries())
    .filter(([, min]) => min > 2400)
    .map(([id, min]) => ({
      name: empMap.get(id)?.name || "-",
      hours: Math.round(min / 60),
    }));

  const dates = [...new Set(records.map((r) => r.date))].sort().reverse();

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "총 근무시간", value: `${Math.round(totalWorkMin / 60)}h`, icon: Clock, gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-200" },
          { label: "초과근무", value: `${Math.round(totalOvertimeMin / 60)}h`, icon: TrendingUp, gradient: "from-rose-500 to-pink-600", shadow: "shadow-rose-200" },
          { label: "지각", value: `${lateCount}건`, icon: AlertTriangle, gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-200" },
          { label: "휴가", value: `${leaveCount}건`, icon: CalendarDays, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-200" },
        ].map((item, i) => (
          <div key={i} className="stat-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.shadow}`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-[20px] font-bold text-gray-900 leading-tight">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 52시간 경고 */}
      {overWorkers.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-orange-800">주 40시간 초과 근무자 감지</p>
            <p className="text-[11px] text-orange-600 mt-0.5">
              {overWorkers.map((w) => `${w.name} (${w.hours}h)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] bg-white h-9"
          >
            <option value="">전체 날짜</option>
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] bg-white h-9"
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="text-[12px] text-gray-400 ml-auto">{filtered.length}건</span>
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-2.5 pr-3">직원</th>
                <th className="text-left py-2.5 pr-3">부서</th>
                <th className="text-left py-2.5 pr-3">날짜</th>
                <th className="text-left py-2.5 pr-3">출근</th>
                <th className="text-left py-2.5 pr-3">퇴근</th>
                <th className="text-left py-2.5 pr-3">근무</th>
                <th className="text-left py-2.5 pr-3">초과</th>
                <th className="text-left py-2.5 pr-3">상태</th>
                <th className="text-left py-2.5">비고</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-[13px] text-gray-400 py-16">
                    근태 기록이 없습니다
                  </td>
                </tr>
              ) : (
                filtered
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((r) => {
                    const emp = empMap.get(r.employee_id);
                    const empName = emp?.name || "-";
                    return (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0 table-row-hover">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(empName)}`}>
                              {empName.charAt(0)}
                            </div>
                            <span className="text-[12px] font-semibold text-gray-800">{empName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-[11px] text-gray-500">{deptMap.get(emp?.department_id || "") || "-"}</td>
                        <td className="py-2.5 pr-3 text-[12px] text-gray-500">{r.date}</td>
                        <td className="py-2.5 pr-3 text-[12px] font-mono text-gray-700">{r.clock_in || "-"}</td>
                        <td className="py-2.5 pr-3 text-[12px] font-mono text-gray-700">{r.clock_out || "-"}</td>
                        <td className="py-2.5 pr-3 text-[12px] text-gray-500">
                          {r.work_minutes > 0 ? `${Math.floor(r.work_minutes / 60)}h ${r.work_minutes % 60}m` : "-"}
                        </td>
                        <td className="py-2.5 pr-3">
                          {r.overtime_minutes > 0 ? (
                            <span className="text-[11px] text-rose-600 font-semibold">+{Math.floor(r.overtime_minutes / 60)}h {r.overtime_minutes % 60}m</span>
                          ) : (
                            <span className="text-[11px] text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`text-[10px] px-2 py-[2px] rounded-md border font-semibold ${statusColor[r.status] || ""}`}>
                            {statusLabel[r.status] || r.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-[11px] text-gray-400 max-w-[120px] truncate">{r.note || ""}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
