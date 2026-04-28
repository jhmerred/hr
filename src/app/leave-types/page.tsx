import { getAuthUser, requireAdmin } from "@/lib/auth";
import { getLeaveTypes } from "@/lib/api";
import { LeaveType } from "@/lib/types";
import { LeaveTypeList } from "@/components/leave/leave-type-list";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function LeaveTypesPage() {
  const user = await getAuthUser();
  requireAdmin(user);

  const result = await safeParallel(
    () => getLeaveTypes(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [data] = result.results;
  const leaveTypes: LeaveType[] = data.rows || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          휴가 유형
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          휴가 유형을 추가하고 관리합니다
        </p>
      </div>
      <LeaveTypeList leaveTypes={leaveTypes} />
    </div>
  );
}
