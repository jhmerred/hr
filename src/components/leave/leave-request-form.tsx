"use client";

import { useState, useMemo } from "react";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { calcBusinessDays, isHoliday, isWeekend } from "@/lib/holidays";
import { createLeaveRequestAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar, Info } from "lucide-react";

export function LeaveRequestForm({
  employees,
  leaveTypes,
  balances,
}: {
  employees: Employee[];
  leaveTypes: LeaveType[];
  balances: LeaveBalance[];
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDay, setHalfDay] = useState<"" | "am" | "pm">("");

  const days = useMemo(() => {
    if (halfDay) return 0.5;
    return calcBusinessDays(startDate, endDate);
  }, [startDate, endDate, halfDay]);

  const currentYear = new Date().getFullYear();
  const remaining = useMemo(() => {
    if (!employeeId || !leaveTypeId) return null;
    const b = balances.find(
      (b) =>
        b.employee_id === employeeId &&
        b.leave_type_id === leaveTypeId &&
        b.year === currentYear
    );
    return b ? b.remaining_days : null;
  }, [employeeId, leaveTypeId, balances, currentYear]);

  const overLimit = remaining !== null && days > remaining;

  // 선택한 기간 내 제외되는 날 분석
  const excludedDays = useMemo(() => {
    if (!startDate || !endDate || halfDay) return { weekends: 0, holidays: [] as string[] };
    const s = new Date(startDate);
    const e = new Date(endDate);
    let weekends = 0;
    const holidays: string[] = [];
    const cur = new Date(s);
    while (cur <= e) {
      const dateStr = cur.toISOString().split("T")[0];
      if (isWeekend(dateStr)) weekends++;
      const h = isHoliday(dateStr);
      if (h && !isWeekend(dateStr)) holidays.push(h.name);
      cur.setDate(cur.getDate() + 1);
    }
    return { weekends, holidays };
  }, [startDate, endDate, halfDay]);

  const totalCalendarDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const selectedLeaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h2 className="text-[15px] font-bold text-gray-900">휴가 신청서</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">공휴일과 주말은 자동으로 제외됩니다</p>
      </div>

      <form
        action={async (formData) => {
          formData.set("days", String(days));
          await createLeaveRequestAction(formData);
          router.push("/leave");
        }}
        className="p-6 space-y-5"
      >
        {/* 직원 선택 */}
        <div>
          <Label htmlFor="employee_id" className="text-[13px] font-semibold text-gray-700">
            신청자
          </Label>
          <select
            id="employee_id"
            name="employee_id"
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white"
          >
            <option value="">직원을 선택하세요</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.position})
              </option>
            ))}
          </select>
        </div>

        {/* 휴가 유형 */}
        <div>
          <Label htmlFor="leave_type_id" className="text-[13px] font-semibold text-gray-700">
            휴가 유형
          </Label>
          <select
            id="leave_type_id"
            name="leave_type_id"
            required
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white"
          >
            <option value="">유형을 선택하세요</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name} (기본 {lt.default_days}일)
              </option>
            ))}
          </select>
          {selectedLeaveType && (
            <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {selectedLeaveType.description}
            </p>
          )}
          {remaining !== null && (
            <div className={`mt-2 text-[12px] font-semibold px-3 py-2 rounded-lg ${
              remaining <= 3
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              잔여 {remaining}일
              {remaining <= 3 && " (잔여일이 적습니다)"}
            </div>
          )}
        </div>

        {/* 반차 여부 */}
        <div>
          <Label className="text-[13px] font-semibold text-gray-700">사용 단위</Label>
          <div className="mt-1.5 flex gap-2">
            {[
              { value: "", label: "종일" },
              { value: "am", label: "오전 반차" },
              { value: "pm", label: "오후 반차" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setHalfDay(opt.value as "" | "am" | "pm");
                  if (opt.value && startDate) setEndDate(startDate);
                }}
                className={`px-4 py-2 rounded-xl text-[12px] font-medium border transition-all ${
                  halfDay === opt.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" className="text-[13px] font-semibold text-gray-700">
              {halfDay ? "날짜" : "시작일"}
            </Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (halfDay) setEndDate(e.target.value);
              }}
              className="mt-1.5 rounded-xl"
            />
          </div>
          {!halfDay && (
            <div>
              <Label htmlFor="end_date" className="text-[13px] font-semibold text-gray-700">
                종료일
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="mt-1.5 rounded-xl"
              />
            </div>
          )}
          {halfDay && (
            <input type="hidden" name="end_date" value={startDate} />
          )}
        </div>

        {/* 일수 계산 결과 */}
        {(days > 0 || halfDay) && startDate && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">실제 사용 일수</span>
              <span className="text-[18px] font-bold text-gray-900">
                {halfDay ? "0.5" : days}일
              </span>
            </div>
            {!halfDay && totalCalendarDays > 0 && (
              <>
                <div className="h-px bg-gray-200" />
                <div className="space-y-1 text-[11px] text-gray-500">
                  <div className="flex justify-between">
                    <span>달력상 기간</span>
                    <span>{totalCalendarDays}일</span>
                  </div>
                  {excludedDays.weekends > 0 && (
                    <div className="flex justify-between">
                      <span>주말 제외</span>
                      <span className="text-blue-500">-{excludedDays.weekends}일</span>
                    </div>
                  )}
                  {excludedDays.holidays.length > 0 && (
                    <div className="flex justify-between">
                      <span>
                        공휴일 제외 ({excludedDays.holidays.join(", ")})
                      </span>
                      <span className="text-red-500">
                        -{excludedDays.holidays.length}일
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            {overLimit && (
              <div className="flex items-center gap-2 text-[11px] text-rose-600 font-semibold bg-rose-50 rounded-lg px-3 py-2 mt-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                잔여 일수({remaining}일)를 초과합니다
              </div>
            )}
          </div>
        )}

        {/* 사유 */}
        <div>
          <Label htmlFor="reason" className="text-[13px] font-semibold text-gray-700">
            사유
          </Label>
          <Textarea
            id="reason"
            name="reason"
            required
            placeholder="휴가 사유를 입력해 주세요"
            className="mt-1.5 rounded-xl min-h-[80px]"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1 rounded-xl h-11 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-200 hover:shadow-lg text-[13px] font-semibold"
            disabled={overLimit || (days === 0 && !halfDay)}
          >
            휴가 신청
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-11 text-[13px]"
            onClick={() => router.back()}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
