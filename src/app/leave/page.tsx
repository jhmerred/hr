import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function LeavePage() {
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
  const requests: LeaveRequest[] = requestsData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            휴가 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            휴가 신청 및 승인을 관리합니다
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
      />
    </div>
  );
}
