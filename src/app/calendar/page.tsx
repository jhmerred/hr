import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { getHolidays } from "@/lib/holidays";
import { CalendarView } from "@/components/calendar/calendar-view";
import { LegalLeaveInfo } from "@/components/calendar/legal-leave-info";
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

      <LegalLeaveInfo />
    </div>
  );
}
