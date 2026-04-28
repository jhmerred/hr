import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";
import { getAuthUser } from "@/lib/auth";

export default async function LeavePage() {
  const user = await getAuthUser();

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
  const allRequests: LeaveRequest[] = requestsData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  // member는 자기 휴가만
  const requests = user.role === "admin"
    ? allRequests
    : allRequests.filter((r) => r.employee_id === user.employeeId);

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isAdmin ? "휴가 관리" : "내 휴가"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? "휴가 신청 및 승인을 관리합니다" : "내 휴가 신청 내역을 확인합니다"}
          </p>
        </div>
        <Link
          href="/leave/new"
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          휴가 신청
        </Link>
      </div>
      <LeaveRequestList
        requests={requests}
        employees={employees}
        leaveTypes={leaveTypes}
        canApprove={isAdmin}
      />
    </div>
  );
}
