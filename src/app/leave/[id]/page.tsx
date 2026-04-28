import { getLeaveRequest, getEmployees, getLeaveTypes } from "@/lib/api";
import { Employee, LeaveType } from "@/lib/types";
import Link from "next/link";
import { LEAVE_STATUS_STYLES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request, employeesData, leaveTypesData] = await Promise.all([
    getLeaveRequest(id),
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
  ]);

  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  const emp = employees.find((e) => e.id === request.employee_id);
  const empName = emp?.name || "-";
  const ltName =
    leaveTypes.find((lt) => lt.id === request.leave_type_id)?.name || "-";
  const status =
    LEAVE_STATUS_STYLES[request.status] || LEAVE_STATUS_STYLES.pending;

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
          <h1 className="text-xl font-bold text-gray-900">휴가 상세</h1>
          <p className="text-sm text-gray-500">휴가 신청 상세 정보</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">휴가 정보</h2>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-semibold ${status.cls}`}
          >
            {status.label}
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 직원 / 유형 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">직원</p>
              <Link
                href={`/employees/${request.employee_id}`}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                {empName}
              </Link>
              {emp && (
                <p className="text-xs text-gray-400 mt-0.5">{emp.position}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">휴가 유형</p>
              <span className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                {ltName}
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 기간 */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">시작일</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.start_date || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">종료일</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.end_date || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">사용 일수</p>
              <p className="text-sm font-semibold text-gray-900">
                {request.days ? `${request.days}일` : "-"}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 사유 */}
          <div>
            <p className="text-xs text-gray-400 mb-1">사유</p>
            <p className="text-sm text-gray-700">
              {request.reason || "-"}
            </p>
          </div>

          {/* 반려 사유 */}
          {request.reject_reason && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-xs text-gray-400 mb-1">반려 사유</p>
                <p className="text-sm text-red-600">{request.reject_reason}</p>
              </div>
            </>
          )}

          {/* 처리 일시 */}
          {request.approved_at && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-xs text-gray-400 mb-1">처리 일시</p>
                <p className="text-sm text-gray-700">
                  {request.approved_at}
                </p>
              </div>
            </>
          )}

          <div className="h-px bg-gray-100" />

          {/* 신청일 */}
          <div>
            <p className="text-xs text-gray-400">
              신청일: {request.created_at?.split("T")[0] || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
