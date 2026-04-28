import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { getHolidays, LEGAL_LEAVE_POLICIES } from "@/lib/holidays";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Scale } from "lucide-react";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function CalendarPage() {
  const currentYear = new Date().getFullYear();

  const result = await safeParallel(
    () => getLeaveRequests(),
    () => getEmployees(),
    () => getLeaveTypes(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [requestsData, employeesData, leaveTypesData] = result.results;

  const [holidaysPrev, holidaysCurrent, holidaysNext] = await Promise.all([
    getHolidays(currentYear - 1).catch(() => []),
    getHolidays(currentYear).catch(() => []),
    getHolidays(currentYear + 1).catch(() => []),
  ]);
  const holidays = [...holidaysPrev, ...holidaysCurrent, ...holidaysNext];

  const requests: LeaveRequest[] = (requestsData.rows || []).filter(
    (r: LeaveRequest) => r.status === "approved" || r.status === "pending"
  );
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          캘린더
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          공휴일과 팀 휴가를 한눈에 확인합니다
        </p>
      </div>

      <CalendarView
        holidays={holidays}
        requests={requests}
        employees={employees}
        leaveTypes={leaveTypes}
      />

      {/* 법정 휴가 제도 안내 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Scale className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              한국 법정 휴가 제도
            </h2>
            <p className="text-xs text-gray-400">
              근로기준법 및 관련 법률에 따른 휴가 기준
            </p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEGAL_LEAVE_POLICIES.map((policy, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    {policy.name}
                  </h3>
                  <div className="flex gap-1.5">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        policy.category === "법정"
                          ? "bg-gray-100 text-gray-700 border border-gray-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {policy.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        policy.paid
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {policy.paid ? "유급" : "무급"}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1.5">
                  {policy.days}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {policy.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
