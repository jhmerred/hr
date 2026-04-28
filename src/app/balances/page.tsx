import { getLeaveBalances, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import { BalanceOverview } from "@/components/leave/balance-overview";

export default async function BalancesPage() {
  const [balancesData, employeesData, leaveTypesData] = await Promise.all([
    getLeaveBalances().catch(() => ({ rows: [] })),
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
  ]);

  const balances: LeaveBalance[] = balancesData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          잔여 휴가
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          직원별 잔여 휴가 현황을 확인합니다
        </p>
      </div>
      <BalanceOverview
        balances={balances}
        employees={employees}
        leaveTypes={leaveTypes}
      />
    </div>
  );
}
