import { getEmployee, getDepartments, getLeaveBalances, getLeaveRequests, getLeaveTypes, getEmployees } from "@/lib/api";
import { Department, LeaveBalance, LeaveRequest, LeaveType } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { LEAVE_STATUS_STYLES } from "@/lib/constants";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";
import { getAuthUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user.employeeId) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gray-500">프로필이 설정되지 않았습니다.</p>
        <p className="text-xs text-gray-400 mt-1">관리자에게 직원 등록을 요청하세요.</p>
      </div>
    );
  }

  const result = await safeParallel(
    () => getEmployee(user.employeeId!),
    () => getDepartments(),
    () => getLeaveBalances({ employee_id: user.employeeId! }),
    () => getLeaveRequests({ employee_id: user.employeeId! }),
    () => getLeaveTypes(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [employee, departmentsData, balancesData, requestsData, leaveTypesData] = result.results;
  const departments: Department[] = departmentsData.rows || [];
  const balances: LeaveBalance[] = balancesData.rows || [];
  const requests: LeaveRequest[] = requestsData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];
  const ltMap = new Map(leaveTypes.map((lt: LeaveType) => [lt.id, lt.name]));

  const currentYear = new Date().getFullYear();
  const currentBalances = balances.filter((b) => b.year === currentYear);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">내 프로필</h1>
        <p className="text-sm text-gray-500 mt-1">내 정보를 확인하고 수정합니다</p>
      </div>

      <EmployeeForm departments={departments} employee={employee} />

      {/* 잔여 휴가 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">{currentYear}년 잔여 휴가</h2>
        </div>
        <div className="px-6 py-4">
          {currentBalances.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">잔여 휴가 데이터가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {currentBalances.map((b) => {
                const pct = b.total_days > 0 ? Math.round((b.used_days / b.total_days) * 100) : 0;
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {ltMap.get(b.leave_type_id) || "-"}
                      </span>
                      <span className="text-xs text-gray-500">
                        <strong className="text-gray-900">{b.remaining_days}</strong>/{b.total_days}일
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-400" : "bg-gray-700"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 최근 휴가 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">최근 휴가 신청</h2>
          <Link href="/leave/new" className="text-xs text-gray-500 hover:text-gray-900">
            휴가 신청 →
          </Link>
        </div>
        <div className="px-6 py-4">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">휴가 신청 기록이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 5).map((r) => {
                const st = LEAVE_STATUS_STYLES[r.status] || LEAVE_STATUS_STYLES.pending;
                return (
                  <Link
                    key={r.id}
                    href={`/leave/${r.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 -mx-3 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {ltMap.get(r.leave_type_id) || "-"} · {r.days}일
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.start_date} ~ {r.end_date}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
