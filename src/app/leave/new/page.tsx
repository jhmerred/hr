import { getEmployees, getLeaveTypes, getLeaveBalances } from "@/lib/api";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";

export default async function NewLeaveRequestPage() {
  const [employeesData, leaveTypesData, balancesData] = await Promise.all([
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
    getLeaveBalances().catch(() => ({ rows: [] })),
  ]);

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
        <h1 className="text-3xl font-bold">휴가 신청</h1>
        <p className="text-muted-foreground mt-1">새 휴가를 신청합니다</p>
      </div>
      <LeaveRequestForm
        employees={employees}
        leaveTypes={leaveTypes}
        balances={balances}
      />
    </div>
  );
}
