"use client";

import { useState, useMemo } from "react";
import { AttendanceRecord, Employee, Department } from "@/lib/types";
import { Clock, TrendingUp, AlertTriangle, CalendarDays } from "lucide-react";
import { ATTENDANCE_STATUS_STYLES, getInitial } from "@/lib/constants";

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
  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE = 10;

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
          { label: "총 근무시간", value: `${Math.round(totalWorkMin / 60)}h`, icon: Clock },
          { label: "초과근무", value: `${Math.round(totalOvertimeMin / 60)}h`, icon: TrendingUp },
          { label: "지각", value: `${lateCount}건`, icon: AlertTriangle },
          { label: "휴가", value: `${leaveCount}건`, icon: CalendarDays },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 52시간 경고 */}
      {overWorkers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800">주 40시간 초과 근무자 감지</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {overWorkers.map((w) => `${w.name} (${w.hours}h)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-9"
          >
            <option value="">전체 날짜</option>
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-9"
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length}건</span>
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
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
                  <td colSpan={9} className="text-center text-sm text-gray-400 py-16">
                    근태 기록이 없습니다
                  </td>
                </tr>
              ) : (
                filtered
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, showAll ? undefined : PAGE_SIZE)
                  .map((r) => {
                    const emp = empMap.get(r.employee_id);
                    const empName = emp?.name || "-";
                    const st = ATTENDANCE_STATUS_STYLES[r.status] || ATTENDANCE_STATUS_STYLES.normal;
                    return (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                              {getInitial(empName)}
                            </div>
                            <span className="text-xs font-semibold text-gray-800">{empName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-gray-500">{deptMap.get(emp?.department_id || "") || "-"}</td>
                        <td className="py-2.5 pr-3 text-xs text-gray-500">{r.date}</td>
                        <td className="py-2.5 pr-3 text-xs font-mono text-gray-700">{r.clock_in || "-"}</td>
                        <td className="py-2.5 pr-3 text-xs font-mono text-gray-700">{r.clock_out || "-"}</td>
                        <td className="py-2.5 pr-3 text-xs text-gray-500">
                          {r.work_minutes > 0 ? `${Math.floor(r.work_minutes / 60)}h ${r.work_minutes % 60}m` : "-"}
                        </td>
                        <td className="py-2.5 pr-3">
                          {r.overtime_minutes > 0 ? (
                            <span className="text-xs text-red-600 font-semibold">+{Math.floor(r.overtime_minutes / 60)}h {r.overtime_minutes % 60}m</span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{r.note || ""}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
          {!showAll && filtered.length > PAGE_SIZE && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <button
                onClick={() => setShowAll(true)}
                className="w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900 py-2"
              >
                {filtered.length - PAGE_SIZE}건 더 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
