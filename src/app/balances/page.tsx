import { getLeaveBalances, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import { BalanceOverview } from "@/components/leave/balance-overview";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";
import { getAuthUser } from "@/lib/auth";

export default async function BalancesPage() {
  const user = await getAuthUser();

  const result = await safeParallel(
    () => getLeaveBalances(),
    () => getEmployees(),
    () => getLeaveTypes(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [balancesData, employeesData, leaveTypesData] = result.results;
  const allBalances: LeaveBalance[] = balancesData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  const balances = user.role === "admin"
    ? allBalances
    : allBalances.filter((b) => b.employee_id === user.employeeId);

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isAdmin ? "잔여 휴가" : "내 잔여 휴가"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin ? "직원별 잔여 휴가 현황을 확인합니다" : "내 휴가 잔여일수를 확인합니다"}
        </p>
      </div>
      <BalanceOverview
        balances={balances}
        employees={employees}
        leaveTypes={leaveTypes}
        canInitialize={isAdmin}
      />
    </div>
  );
}
