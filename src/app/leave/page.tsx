import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function LeavePage() {
  const [requestsData, employeesData, leaveTypesData] = await Promise.all([
    getLeaveRequests().catch(() => ({ rows: [] })),
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
  ]);

  const requests: LeaveRequest[] = requestsData.rows || [];
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
            휴가 관리
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            휴가 신청 및 승인을 관리합니다
          </p>
        </div>
        <Link
          href="/leave/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all"
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
