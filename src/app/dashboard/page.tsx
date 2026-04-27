import {
  getEmployees,
  getLeaveRequests,
  getDepartments,
  getAttendanceRecords,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [employeesData, requestsData, departmentsData, attendanceData] =
    await Promise.all([
      getEmployees().catch(() => ({ rows: [] })),
      getLeaveRequests().catch(() => ({ rows: [] })),
      getDepartments().catch(() => ({ rows: [] })),
      getAttendanceRecords().catch(() => ({ rows: [] })),
    ]);

  const employees = employeesData.rows || [];
  const requests = requestsData.rows || [];
  const departments = departmentsData.rows || [];
  const attendance = attendanceData.rows || [];

  const activeEmployees = employees.filter(
    (e: { status: string }) => e.status === "active"
  );
  const pendingRequests = requests.filter(
    (r: { status: string }) => r.status === "pending"
  );

  // 이번 주 근태 통계
  const thisWeekAttendance = attendance.filter((a: { date: string }) => {
    return a.date >= "2026-04-21" && a.date <= "2026-04-27";
  });
  const totalOvertimeMin = thisWeekAttendance.reduce(
    (sum: number, a: { overtime_minutes: number }) => sum + (a.overtime_minutes || 0),
    0
  );
  const lateCount = thisWeekAttendance.filter(
    (a: { status: string }) => a.status === "late"
  ).length;

  const deptMap = new Map(
    departments.map((d: { id: string; name: string }) => [d.id, d.name])
  );

  // 부서별 인원 수
  const deptCounts = departments.map((d: { id: string; name: string }) => ({
    name: d.name,
    count: employees.filter(
      (e: { department_id: string }) => e.department_id === d.id
    ).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          오늘의 HR 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">전체 직원</p>
                <p className="text-2xl font-bold mt-1">{activeEmployees.length}<span className="text-sm font-normal text-gray-400">명</span></p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">대기 중 휴가</p>
                <p className="text-2xl font-bold mt-1">{pendingRequests.length}<span className="text-sm font-normal text-gray-400">건</span></p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">이번 주 초과근무</p>
                <p className="text-2xl font-bold mt-1">{Math.round(totalOvertimeMin / 60)}<span className="text-sm font-normal text-gray-400">시간</span></p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">이번 주 지각</p>
                <p className="text-2xl font-bold mt-1">{lateCount}<span className="text-sm font-normal text-gray-400">건</span></p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 대기 중 휴가 */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">승인 대기 중인 휴가</CardTitle>
              <Link href="/leave" className="text-xs text-blue-600 hover:underline">
                전체 보기
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                대기 중인 신청이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.slice(0, 5).map(
                  (req: {
                    id: string;
                    employee_id: string;
                    start_date: string;
                    end_date: string;
                    days: number;
                    reason: string;
                  }) => {
                    const empName =
                      employees.find(
                        (e: { id: string }) => e.id === req.employee_id
                      )?.name || "-";
                    return (
                      <Link
                        key={req.id}
                        href={`/leave/${req.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                            {empName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{empName}</p>
                            <p className="text-xs text-gray-500">
                              {req.start_date} ~ {req.end_date} ({req.days}일)
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          대기
                        </Badge>
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 부서별 인원 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">부서별 인원</CardTitle>
              <Link href="/organization" className="text-xs text-blue-600 hover:underline">
                조직도
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deptCounts.map(
                (dept: { name: string; count: number }, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-gray-700">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              (dept.count / Math.max(...deptCounts.map((d: { count: number }) => d.count))) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {dept.count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 근태 현황 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">이번 주 근태 현황</CardTitle>
            <Link href="/attendance" className="text-xs text-blue-600 hover:underline">
              전체 보기
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b">
                  <th className="text-left py-2 font-medium">직원</th>
                  <th className="text-left py-2 font-medium">날짜</th>
                  <th className="text-left py-2 font-medium">출근</th>
                  <th className="text-left py-2 font-medium">퇴근</th>
                  <th className="text-left py-2 font-medium">근무</th>
                  <th className="text-left py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {thisWeekAttendance
                  .sort(
                    (a: { date: string }, b: { date: string }) =>
                      b.date.localeCompare(a.date)
                  )
                  .slice(0, 8)
                  .map(
                    (a: {
                      id: string;
                      employee_id: string;
                      date: string;
                      clock_in: string;
                      clock_out: string;
                      work_minutes: number;
                      status: string;
                    }) => {
                      const emp = employees.find(
                        (e: { id: string }) => e.id === a.employee_id
                      );
                      const statusLabel: Record<string, string> = {
                        normal: "정상",
                        late: "지각",
                        overtime: "초과근무",
                        leave: "휴가",
                        absent: "결근",
                      };
                      const statusColor: Record<string, string> = {
                        normal: "text-green-600 bg-green-50",
                        late: "text-orange-600 bg-orange-50",
                        overtime: "text-red-600 bg-red-50",
                        leave: "text-blue-600 bg-blue-50",
                        absent: "text-gray-600 bg-gray-100",
                      };
                      return (
                        <tr key={a.id} className="border-b last:border-0">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {emp?.name?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium">{emp?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-gray-500">{a.date}</td>
                          <td className="py-2.5">{a.clock_in || "-"}</td>
                          <td className="py-2.5">{a.clock_out || "-"}</td>
                          <td className="py-2.5 text-gray-500">
                            {a.work_minutes > 0
                              ? `${Math.floor(a.work_minutes / 60)}h ${a.work_minutes % 60}m`
                              : "-"}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                statusColor[a.status] || "text-gray-500 bg-gray-50"
                              }`}
                            >
                              {statusLabel[a.status] || a.status}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
