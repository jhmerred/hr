import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { Button } from "@/components/ui/button";
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
          <h1 className="text-3xl font-bold">휴가 관리</h1>
          <p className="text-muted-foreground mt-1">
            휴가 신청 및 승인을 관리합니다
          </p>
        </div>
        <Link href="/leave/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            휴가 신청
          </Button>
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
