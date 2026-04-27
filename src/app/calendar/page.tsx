import { getLeaveRequests, getEmployees, getLeaveTypes } from "@/lib/api";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { getHolidays, LEGAL_LEAVE_POLICIES } from "@/lib/holidays";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Scale } from "lucide-react";

export default async function CalendarPage() {
  const [requestsData, employeesData, leaveTypesData] = await Promise.all([
    getLeaveRequests().catch(() => ({ rows: [] })),
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
  ]);

  const requests: LeaveRequest[] = (requestsData.rows || []).filter(
    (r: LeaveRequest) => r.status === "approved" || r.status === "pending"
  );
  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  const currentYear = new Date().getFullYear();
  const holidays = getHolidays(currentYear);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          캘린더
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">
          공휴일과 팀 휴가를 한눈에 확인합니다
        </p>
      </div>

      <CalendarView
        holidays={holidays}
        requests={requests}
        employees={employees}
        leaveTypes={leaveTypes}
      />

      {/* 법정 휴가 제도 안내 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Scale className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-gray-900">
              한국 법정 휴가 제도
            </h2>
            <p className="text-[11px] text-gray-400">
              근로기준법 및 관련 법률에 따른 휴가 기준
            </p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEGAL_LEAVE_POLICIES.map((policy, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[13px] font-bold text-gray-800">
                    {policy.name}
                  </h3>
                  <div className="flex gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        policy.category === "법정"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {policy.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        policy.paid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {policy.paid ? "유급" : "무급"}
                    </span>
                  </div>
                </div>
                <p className="text-[12px] font-semibold text-indigo-600 mb-1.5">
                  {policy.days}
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {policy.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
