"use client";

import { useState, useMemo } from "react";
import { AttendanceRecord, Employee, Department } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, TrendingUp, CalendarDays } from "lucide-react";

const statusLabel: Record<string, string> = {
  normal: "정상",
  late: "지각",
  early_leave: "조퇴",
  overtime: "초과근무",
  leave: "휴가",
  absent: "결근",
};

const statusColor: Record<string, string> = {
  normal: "text-green-700 bg-green-50 border-green-200",
  late: "text-orange-700 bg-orange-50 border-orange-200",
  early_leave: "text-yellow-700 bg-yellow-50 border-yellow-200",
  overtime: "text-red-700 bg-red-50 border-red-200",
  leave: "text-blue-700 bg-blue-50 border-blue-200",
  absent: "text-gray-700 bg-gray-50 border-gray-200",
};

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

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const emp = empMap.get(r.employee_id);
      const matchDept = !deptFilter || emp?.department_id === deptFilter;
      const matchDate = !dateFilter || r.date === dateFilter;
      return matchDept && matchDate;
    });
  }, [records, deptFilter, dateFilter, empMap]);

  // 통계
  const totalWorkMin = filtered.reduce((s, r) => s + (r.work_minutes || 0), 0);
  const totalOvertimeMin = filtered.reduce(
    (s, r) => s + (r.overtime_minutes || 0),
    0
  );
  const lateCount = filtered.filter((r) => r.status === "late").length;
  const leaveCount = filtered.filter((r) => r.status === "leave").length;

  // 주간 52시간 경고 (직원별)
  const weeklyHours = new Map<string, number>();
  records.forEach((r) => {
    const current = weeklyHours.get(r.employee_id) || 0;
    weeklyHours.set(r.employee_id, current + (r.work_minutes || 0));
  });
  const overWorkers = Array.from(weeklyHours.entries())
    .filter(([, min]) => min > 2400) // 40시간 = 2400분 (주 기준)
    .map(([id, min]) => ({
      name: empMap.get(id)?.name || "-",
      hours: Math.round(min / 60),
    }));

  const dates = [...new Set(records.map((r) => r.date))].sort().reverse();

  return (
    <div className="space-y-4">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">총 근무시간</p>
                <p className="text-lg font-bold">{Math.round(totalWorkMin / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">초과근무</p>
                <p className="text-lg font-bold">{Math.round(totalOvertimeMin / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">지각</p>
                <p className="text-lg font-bold">{lateCount}건</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500">휴가</p>
                <p className="text-lg font-bold">{leaveCount}건</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 52시간 경고 */}
      {overWorkers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                주 40시간 초과 근무자: {overWorkers.map((w) => `${w.name}(${w.hours}h)`).join(", ")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 + 테이블 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">전체 날짜</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">전체 부서</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b">
                  <th className="text-left py-2 font-medium">직원</th>
                  <th className="text-left py-2 font-medium">부서</th>
                  <th className="text-left py-2 font-medium">날짜</th>
                  <th className="text-left py-2 font-medium">출근</th>
                  <th className="text-left py-2 font-medium">퇴근</th>
                  <th className="text-left py-2 font-medium">근무시간</th>
                  <th className="text-left py-2 font-medium">초과</th>
                  <th className="text-left py-2 font-medium">상태</th>
                  <th className="text-left py-2 font-medium">비고</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center text-gray-400 py-8"
                    >
                      근태 기록이 없습니다
                    </td>
                  </tr>
                ) : (
                  filtered
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((r) => {
                      const emp = empMap.get(r.employee_id);
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold">
                                {emp?.name?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium">
                                {emp?.name || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-gray-500">
                            {deptMap.get(emp?.department_id || "") || "-"}
                          </td>
                          <td className="py-2.5 text-gray-500">{r.date}</td>
                          <td className="py-2.5 font-mono">
                            {r.clock_in || "-"}
                          </td>
                          <td className="py-2.5 font-mono">
                            {r.clock_out || "-"}
                          </td>
                          <td className="py-2.5">
                            {r.work_minutes > 0
                              ? `${Math.floor(r.work_minutes / 60)}h ${r.work_minutes % 60}m`
                              : "-"}
                          </td>
                          <td className="py-2.5">
                            {r.overtime_minutes > 0 ? (
                              <span className="text-red-600 font-medium">
                                +{Math.floor(r.overtime_minutes / 60)}h{" "}
                                {r.overtime_minutes % 60}m
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                statusColor[r.status] || ""
                              }`}
                            >
                              {statusLabel[r.status] || r.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-400 text-xs max-w-[150px] truncate">
                            {r.note || ""}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
