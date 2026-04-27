import { getLeaveTypes } from "@/lib/api";
import { LeaveType } from "@/lib/types";
import { LeaveTypeList } from "@/components/leave/leave-type-list";

export default async function LeaveTypesPage() {
  const data = await getLeaveTypes().catch(() => ({ rows: [] }));
  const leaveTypes: LeaveType[] = data.rows || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          휴가 유형
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">
          휴가 유형을 추가하고 관리합니다
        </p>
      </div>
      <LeaveTypeList leaveTypes={leaveTypes} />
    </div>
  );
}
