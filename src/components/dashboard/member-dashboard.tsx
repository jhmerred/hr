"use client";

import { Employee, LeaveBalance, LeaveRequest, AttendanceRecord, LeaveType } from "@/lib/types";
import { LEAVE_STATUS_STYLES, ATTENDANCE_STATUS_STYLES, getInitial } from "@/lib/constants";
import { clockInAction, clockOutAction } from "@/app/actions";
import { useState } from "react";
import { LogIn, LogOut, CalendarDays, Clock, Palmtree } from "lucide-react";
import { useToast } from "@/components/toast";
import Link from "next/link";

export function MemberDashboard({
  employee,
  balances,
  requests,
  todayRecord,
  leaveTypes,
}: {
  employee: Employee;
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  todayRecord: AttendanceRecord | null;
  leaveTypes: LeaveType[];
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const currentYear = new Date().getFullYear();
  const yearBalances = balances.filter((b) => b.year === currentYear);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const recentRequests = requests.slice(0, 5);

  const isWorking = todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
  const isDone = todayRecord && todayRecord.clock_in && todayRecord.clock_out;

  async function handleClockIn() {
    setLoading(true);
    try {
      await clockInAction(employee.id);
      toast.success("출근이 기록되었습니다");
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    if (!todayRecord) return;
    setLoading(true);
    try {
      await clockOutAction(todayRecord.id, todayRecord.clock_in);
      toast.success("퇴근이 기록되었습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 인사 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          안녕하세요, {employee.name}님
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {employee.position} · {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 출퇴근 카드 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">오늘의 근무</p>
              {isDone ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  {todayRecord.clock_in} → {todayRecord.clock_out} ·{" "}
                  {Math.floor(todayRecord.work_minutes / 60)}시간 {todayRecord.work_minutes % 60}분
                </p>
              ) : isWorking ? (
                <p className="text-xs text-green-600 mt-0.5 font-medium">
                  {todayRecord.clock_in} 출근 · 근무 중
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">아직 출근 전입니다</p>
              )}
            </div>
          </div>

          {isDone ? (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium">
              퇴근 완료
            </span>
          ) : isWorking ? (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              퇴근
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              출근
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 잔여 휴가 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Palmtree className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">{currentYear}년 잔여 휴가</h2>
            </div>
            <Link
              href="/balances"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="px-5 pb-5">
            {yearBalances.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">잔여 휴가 데이터가 없습니다</p>
            ) : (
              <div className="space-y-3">
                {yearBalances.map((b) => {
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

        {/* 최근 휴가 신청 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">
                내 휴가 신청
                {pendingRequests.length > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-gray-900 rounded-full px-2 py-0.5">
                    {pendingRequests.length}
                  </span>
                )}
              </h2>
            </div>
            <Link
              href="/leave/new"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              휴가 신청 →
            </Link>
          </div>
          <div className="px-5 pb-5">
            {recentRequests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">신청 내역이 없습니다</p>
                <Link
                  href="/leave/new"
                  className="text-xs text-gray-600 hover:text-gray-900 hover:underline mt-1 inline-block"
                >
                  휴가 신청하기
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRequests.map((r) => {
                  const st = LEAVE_STATUS_STYLES[r.status] || LEAVE_STATUS_STYLES.pending;
                  return (
                    <Link
                      key={r.id}
                      href={`/leave/${r.id}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3"
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
    </div>
  );
}
