import {
  getEmployees,
  getLeaveRequests,
  getDepartments,
  getAttendanceRecords,
  getLeaveBalances,
} from "@/lib/api";
import {
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const avatarColors = [
  "avatar-blue",
  "avatar-purple",
  "avatar-green",
  "avatar-amber",
  "avatar-rose",
  "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default async function DashboardPage() {
  const [employeesData, requestsData, departmentsData, attendanceData, balancesData] =
    await Promise.all([
      getEmployees().catch(() => ({ rows: [] })),
      getLeaveRequests().catch(() => ({ rows: [] })),
      getDepartments().catch(() => ({ rows: [] })),
      getAttendanceRecords().catch(() => ({ rows: [] })),
      getLeaveBalances().catch(() => ({ rows: [] })),
    ]);

  const employees = employeesData.rows || [];
  const requests = requestsData.rows || [];
  const departments = departmentsData.rows || [];
  const attendance = attendanceData.rows || [];
  const balances = balancesData.rows || [];

  const activeEmployees = employees.filter(
    (e: { status: string }) => e.status === "active"
  );
  const pendingRequests = requests.filter(
    (r: { status: string }) => r.status === "pending"
  );
  const approvedRequests = requests.filter(
    (r: { status: string }) => r.status === "approved"
  );

  // 이번 주 월~일 범위 동적 계산
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  let thisWeekAttendance = attendance.filter((a: { date: string }) => {
    return a.date >= weekStart && a.date <= weekEnd;
  });
  // 이번 주 데이터 없으면 최근 데이터로 대체
  const recentAttendance = [...attendance]
    .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));
  if (thisWeekAttendance.length === 0) {
    thisWeekAttendance = recentAttendance;
  }
  const totalOvertimeMin = thisWeekAttendance.reduce(
    (sum: number, a: { overtime_minutes: number }) => sum + (a.overtime_minutes || 0),
    0
  );
  const lateCount = thisWeekAttendance.filter(
    (a: { status: string }) => a.status === "late"
  ).length;

  // 연차 소진율 (평균)
  const currentYear = today.getFullYear();
  const annualBalances = balances.filter(
    (b: { year: number }) => b.year === currentYear
  );
  const avgUsageRate =
    annualBalances.length > 0
      ? Math.round(
          (annualBalances.reduce(
            (s: number, b: { used_days: number }) => s + b.used_days,
            0
          ) /
            annualBalances.reduce(
              (s: number, b: { total_days: number }) => s + b.total_days,
              0
            )) *
            100
        )
      : 0;

  const deptCounts = departments.map((d: { id: string; name: string }) => ({
    name: d.name,
    count: employees.filter(
      (e: { department_id: string }) => e.department_id === d.id
    ).length,
  }));
  const maxDeptCount = Math.max(...deptCounts.map((d: { count: number }) => d.count), 1);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          대시보드
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">
          HR 현황을 한눈에 확인하세요. 오늘은{" "}
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
          입니다.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/employees" className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                전체 직원
              </p>
              <p className="text-[28px] font-bold text-gray-900 mt-1 leading-none">
                {activeEmployees.length}
                <span className="text-[13px] font-normal text-gray-400 ml-0.5">명</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                {departments.length}개 부서
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/leave" className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                대기 중 휴가
              </p>
              <p className="text-[28px] font-bold text-gray-900 mt-1 leading-none">
                {pendingRequests.length}
                <span className="text-[13px] font-normal text-gray-400 ml-0.5">건</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                승인 {approvedRequests.length}건
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/attendance" className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                주간 초과근무
              </p>
              <p className="text-[28px] font-bold text-gray-900 mt-1 leading-none">
                {Math.round(totalOvertimeMin / 60)}
                <span className="text-[13px] font-normal text-gray-400 ml-0.5">시간</span>
              </p>
              <p className="text-[11px] text-red-400 mt-2">
                {lateCount > 0 ? `지각 ${lateCount}건` : "지각 없음"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/balances" className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                연차 소진율
              </p>
              <p className="text-[28px] font-bold text-gray-900 mt-1 leading-none">
                {avgUsageRate}
                <span className="text-[13px] font-normal text-gray-400 ml-0.5">%</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                {currentYear}년 평균
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 대기 중 휴가 (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-[14px] font-bold text-gray-900">
              승인 대기 중
              {pendingRequests.length > 0 && (
                <span className="ml-2 text-[11px] font-semibold text-white bg-blue-500 rounded-full px-2 py-0.5">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
            <Link
              href="/leave"
              className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              전체 보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 pb-4">
            {pendingRequests.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-200 mx-auto" />
                <p className="text-[13px] text-gray-400 mt-3">
                  대기 중인 신청이 없습니다
                </p>
              </div>
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
                    const emp = employees.find(
                      (e: { id: string }) => e.id === req.employee_id
                    );
                    const empName = emp?.name || "-";
                    return (
                      <Link
                        key={req.id}
                        href={`/leave/${req.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${getAvatarColor(empName)}`}
                        >
                          {empName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-gray-800">
                              {empName}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {emp?.position}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {req.start_date} ~ {req.end_date} &middot; {req.days}일 &middot; {req.reason}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                          대기
                        </span>
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* 부서별 인원 (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-[14px] font-bold text-gray-900">부서별 인원</h2>
            <Link
              href="/organization"
              className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              조직도 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {deptCounts.map(
              (dept: { name: string; count: number }, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-gray-600">
                      {dept.name}
                    </span>
                    <span className="text-[12px] font-bold text-gray-900">
                      {dept.count}명
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                      style={{
                        width: `${(dept.count / maxDeptCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 근태 현황 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-[14px] font-bold text-gray-900">
            최근 근태
          </h2>
          <Link
            href="/attendance"
            className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
          >
            전체 보기 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-2.5 pr-4">직원</th>
                <th className="text-left py-2.5 pr-4">날짜</th>
                <th className="text-left py-2.5 pr-4">출근</th>
                <th className="text-left py-2.5 pr-4">퇴근</th>
                <th className="text-left py-2.5 pr-4">근무</th>
                <th className="text-left py-2.5">상태</th>
              </tr>
            </thead>
            <tbody>
              {thisWeekAttendance
                .sort(
                  (a: { date: string }, b: { date: string }) =>
                    b.date.localeCompare(a.date)
                )
                .slice(0, 10)
                .map(
                  (a: {
                    id: string;
                    employee_id: string;
                    date: string;
                    clock_in: string;
                    clock_out: string;
                    work_minutes: number;
                    overtime_minutes: number;
                    status: string;
                  }) => {
                    const emp = employees.find(
                      (e: { id: string }) => e.id === a.employee_id
                    );
                    const empName = emp?.name || "-";
                    const statusMap: Record<
                      string,
                      { label: string; cls: string }
                    > = {
                      normal: { label: "정상", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                      late: { label: "지각", cls: "text-orange-700 bg-orange-50 border-orange-200" },
                      overtime: { label: "초과", cls: "text-rose-700 bg-rose-50 border-rose-200" },
                      leave: { label: "휴가", cls: "text-blue-700 bg-blue-50 border-blue-200" },
                    };
                    const st = statusMap[a.status] || statusMap.normal;
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 last:border-0 table-row-hover"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(empName)}`}
                            >
                              {empName.charAt(0)}
                            </div>
                            <span className="text-[13px] font-medium text-gray-800">
                              {empName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[12px] text-gray-500">
                          {a.date}
                        </td>
                        <td className="py-3 pr-4 text-[13px] font-mono text-gray-700">
                          {a.clock_in || "-"}
                        </td>
                        <td className="py-3 pr-4 text-[13px] font-mono text-gray-700">
                          {a.clock_out || "-"}
                        </td>
                        <td className="py-3 pr-4 text-[12px] text-gray-500">
                          {a.work_minutes > 0
                            ? `${Math.floor(a.work_minutes / 60)}h ${a.work_minutes % 60}m`
                            : "-"}
                          {a.overtime_minutes > 0 && (
                            <span className="text-rose-500 ml-1 font-medium">
                              (+{a.overtime_minutes}m)
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[11px] px-2 py-[3px] rounded-md border font-semibold ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
