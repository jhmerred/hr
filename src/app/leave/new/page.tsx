import { getEmployees, getLeaveTypes, getLeaveBalances } from "@/lib/api";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { getHolidays } from "@/lib/holidays";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { getAuthUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      <div className="flex items-center gap-3">
        <Link
          href="/leave"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">휴가 신청</h1>
          <p className="text-sm text-gray-500">날짜와 사유를 입력하세요</p>
        </div>
      </div>
      <LeaveRequestForm
        employees={employees}
        leaveTypes={leaveTypes}
        balances={balances}
        holidays={holidays}
        currentUserEmail={user.email}
        isAdmin={user.role === "admin"}
      />
    </div>
  );
}
