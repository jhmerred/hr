import {
  getAttendanceRecords,
  getEmployees,
  getDepartments,
} from "@/lib/api";
import { Employee, Department, AttendanceRecord } from "@/lib/types";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { ClockPanel } from "@/components/attendance/clock-panel";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";
import { formatLocalDate } from "@/lib/holidays";

export default async function AttendancePage() {
  const result = await safeParallel(
    () => getAttendanceRecords(),
    () => getEmployees(),
    () => getDepartments(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [attendanceData, employeesData, departmentsData] = result.results;
  const records: AttendanceRecord[] = attendanceData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const departments: Department[] = departmentsData.rows || [];

  const today = formatLocalDate(new Date());
  const todayRecords = records.filter((r) => r.date === today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">근태 현황</h1>
        <p className="text-sm text-gray-500 mt-1">
          직원별 출퇴근 기록과 근무시간을 확인합니다
        </p>
      </div>
      <ClockPanel employees={employees} todayRecords={todayRecords} />
      <AttendanceDashboard
        records={records}
        employees={employees}
        departments={departments}
      />
    </div>
  );
}
