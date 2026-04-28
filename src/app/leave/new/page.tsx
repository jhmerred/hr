import { getEmployees, getLeaveTypes, getLeaveBalances } from "@/lib/api";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { getHolidays } from "@/lib/holidays";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function NewLeaveRequestPage() {
  const currentYear = new Date().getFullYear();

  const result = await safeParallel(
    () => getEmployees(),
    () => getLeaveTypes(),
    () => getLeaveBalances(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [employeesData, leaveTypesData, balancesData] = result.results;

  const holidays = await getHolidays(currentYear).catch(() => []);
  const user = await getAuthUser();

  const employees: Employee[] = (employeesData.rows || []).filter(
    (e: Employee) => e.status === "active"
  );
  const leaveTypes: LeaveType[] = (leaveTypesData.rows || []).filter(
    (lt: LeaveType) => lt.is_active
  );
  const balances: LeaveBalance[] = balancesData.rows || [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">휴가 신청</h1>
        <p className="text-sm text-gray-500 mt-1">새 휴가를 신청합니다</p>
      </div>
      <LeaveRequestForm
        employees={employees}
        leaveTypes={leaveTypes}
        balances={balances}
        holidays={holidays}
        currentUserEmail={user.email}
      />
    </div>
  );
}
