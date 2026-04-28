import {
  getEmployee,
  getDepartments,
  getLeaveBalances,
  getLeaveRequests,
} from "@/lib/api";
import { Department, LeaveBalance, LeaveRequest } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LEAVE_STATUS_STYLES } from "@/lib/constants";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await safeParallel(
    () => getEmployee(id),
    () => getDepartments(),
    () => getLeaveBalances({ employee_id: id }),
    () => getLeaveRequests({ employee_id: id }),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [employee, departmentsData, balancesData, requestsData] = result.results;
  const departments: Department[] = departmentsData.rows || [];
  const balances: LeaveBalance[] = balancesData.rows || [];
  const requests: LeaveRequest[] = requestsData.rows || [];

  const currentYear = new Date().getFullYear();
  const currentBalances = balances.filter((b) => b.year === currentYear);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/employees"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">직원 상세</h1>
          <p className="text-sm text-gray-500">{employee.name || ""}</p>
        </div>
      </div>

      <EmployeeForm departments={departments} employee={employee} />

      {/* 잔여 휴가 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">
            {currentYear}년 잔여 휴가
          </h2>
        </div>
        <div className="px-6 py-4">
          {currentBalances.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              잔여 휴가 데이터가 없습니다.{" "}
              <Link href="/balances" className="text-blue-600 hover:underline">
                잔여 휴가 페이지
              </Link>
              에서 초기화해 주세요.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="text-left py-2">휴가 유형</th>
                    <th className="text-left py-2">총 일수</th>
                    <th className="text-left py-2">사용</th>
                    <th className="text-left py-2">잔여</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBalances.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2 text-sm text-gray-700">
                        {b.leave_type_id}
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        {b.total_days}
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        {b.used_days}
                      </td>
                      <td className="py-2">
                        <span
                          className={`text-sm font-bold ${
                            b.remaining_days <= 3
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {b.remaining_days}일
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 최근 휴가 신청 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">최근 휴가 신청</h2>
        </div>
        <div className="px-6 py-4">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              휴가 신청 기록이 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="text-left py-2">기간</th>
                    <th className="text-left py-2">일수</th>
                    <th className="text-left py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 10).map((r) => {
                    const st =
                      LEAVE_STATUS_STYLES[r.status] ||
                      LEAVE_STATUS_STYLES.pending;
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-2">
                          <Link
                            href={`/leave/${r.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {r.start_date} ~ {r.end_date}
                          </Link>
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {r.days}일
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded border font-semibold ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
