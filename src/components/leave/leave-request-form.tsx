"use client";

import { useState, useMemo } from "react";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { Holiday, calcBusinessDays, isHolidaySync, isWeekend } from "@/lib/holidays";
import { createLeaveRequestAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function LeaveRequestForm({
  employees,
  leaveTypes,
  balances,
  holidays = [],
}: {
  employees: Employee[];
  leaveTypes: LeaveType[];
  balances: LeaveBalance[];
  holidays?: Holiday[];
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDay, setHalfDay] = useState<"" | "am" | "pm">("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 캘린더 상태
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectingEnd, setSelectingEnd] = useState(false);

  const days = useMemo(() => {
    if (halfDay) return 0.5;
    return calcBusinessDays(startDate, endDate, holidays);
  }, [startDate, endDate, halfDay, holidays]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
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
  const selectedLeaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);

  // 제외일 분석
  const excludedInfo = useMemo(() => {
    if (!startDate || !endDate || halfDay)
      return { weekends: 0, holidayNames: [] as string[], total: 0 };
    const s = new Date(startDate);
    const e = new Date(endDate);
    let weekends = 0;
    const holidayNames: string[] = [];
    let total = 0;
    const cur = new Date(s);
    while (cur <= e) {
      total++;
      const ds = cur.toISOString().split("T")[0];
      if (isWeekend(ds)) weekends++;
      else {
        const h = isHolidaySync(ds, holidays);
        if (h) holidayNames.push(h.name);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { weekends, holidayNames, total };
  }, [startDate, endDate, halfDay, holidays]);

  // 캘린더 날짜 생성
  const calendarDays = useMemo(() => {
    const holidayMap = new Map(holidays.map((h) => [h.date, h]));
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    const startPad = first.getDay();
    const result: {
      date: string;
      day: number;
      inMonth: boolean;
      isWeekend: boolean;
      holiday?: Holiday;
      isToday: boolean;
      isStart: boolean;
      isEnd: boolean;
      inRange: boolean;
    }[] = [];

    // 이전 달 패딩
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(calYear, calMonth, -i);
      const ds = d.toISOString().split("T")[0];
      result.push({
        date: ds,
        day: d.getDate(),
        inMonth: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        holiday: holidayMap.get(ds),
        isToday: false,
        isStart: false,
        isEnd: false,
        inRange: false,
      });
    }

    const todayDate = new Date().toISOString().split("T")[0];

    // 이번 달
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = toDateStr(calYear, calMonth, d);
      const date = new Date(calYear, calMonth, d);
      const inRange =
        startDate && endDate && ds >= startDate && ds <= endDate;
      result.push({
        date: ds,
        day: d,
        inMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        holiday: holidayMap.get(ds),
        isToday: ds === todayDate,
        isStart: ds === startDate,
        isEnd: ds === endDate,
        inRange: !!inRange,
      });
    }

    // 다음 달 패딩 (6주 채우기)
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calYear, calMonth + 1, i);
      const ds = d.toISOString().split("T")[0];
      result.push({
        date: ds,
        day: d.getDate(),
        inMonth: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        holiday: holidayMap.get(ds),
        isToday: false,
        isStart: false,
        isEnd: false,
        inRange: false,
      });
    }

    return result;
  }, [calYear, calMonth, holidays, startDate, endDate]);

  const goMonth = (delta: number) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
  };

  function handleDateClick(date: string) {
    if (halfDay) {
      setStartDate(date);
      setEndDate(date);
      return;
    }

    if (!selectingEnd || !startDate) {
      setStartDate(date);
      setEndDate("");
      setSelectingEnd(true);
    } else {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      setSelectingEnd(false);
    }
  }

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("employee_id", employeeId);
      formData.set("leave_type_id", leaveTypeId);
      formData.set("start_date", startDate);
      formData.set("end_date", endDate || startDate);
      formData.set("days", String(days));
      formData.set("reason", reason);
      await createLeaveRequestAction(formData);
      router.push("/leave");
    } catch {
      setError("휴가 신청에 실패했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  const canSubmit =
    employeeId &&
    leaveTypeId &&
    startDate &&
    (halfDay || endDate) &&
    days > 0 &&
    !overLimit &&
    reason.trim() &&
    !submitting;

  return (
    <div className="space-y-5">
      {/* 1. 신청자 + 휴가 유형 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-2">
            신청자
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">직원을 선택하세요</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} · {emp.position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-2">
            휴가 유형
          </label>
          <select
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">유형을 선택하세요</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
          {selectedLeaveType && (
            <p className="mt-2 text-[12px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-300" />
              {selectedLeaveType.description}
            </p>
          )}
          {remaining !== null && (
            <div
              className={`mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-semibold ${
                remaining <= 3
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}
            >
              <span>잔여 일수</span>
              <span>{remaining}일</span>
            </div>
          )}
        </div>

        {/* 반차 */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-2">
            사용 단위
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "", label: "종일", desc: "하루 이상" },
              { value: "am", label: "오전 반차", desc: "0.5일" },
              { value: "pm", label: "오후 반차", desc: "0.5일" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setHalfDay(opt.value as "" | "am" | "pm");
                  if (opt.value && startDate) {
                    setEndDate(startDate);
                    setSelectingEnd(false);
                  } else {
                    setEndDate("");
                    setSelectingEnd(false);
                  }
                }}
                className={`px-3 py-3 rounded-xl text-center border-2 transition-all ${
                  halfDay === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <p
                  className={`text-[13px] font-semibold ${
                    halfDay === opt.value ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 날짜 선택 캘린더 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-gray-800">
              {halfDay ? "날짜 선택" : selectingEnd && startDate ? "종료일을 선택하세요" : "시작일을 선택하세요"}
            </p>
            {startDate && (
              <p className="text-[12px] text-blue-600 font-medium">
                {startDate}
                {endDate && endDate !== startDate && ` ~ ${endDate}`}
              </p>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* 월 이동 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[14px] font-bold text-gray-900">
              {calYear}년 {calMonth + 1}월
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={`text-center text-[11px] font-bold py-1.5 ${
                  i === 0
                    ? "text-rose-400"
                    : i === 6
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((d, i) => {
              const isOff = d.isWeekend || !!d.holiday;
              const isSelected = d.isStart || d.isEnd;
              const isPast = d.date < todayStr;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!d.inMonth || isPast}
                  onClick={() => d.inMonth && !isPast && handleDateClick(d.date)}
                  className={`
                    relative h-11 flex flex-col items-center justify-center text-[13px] transition-all
                    ${!d.inMonth ? "text-gray-200 cursor-default" : ""}
                    ${isPast && d.inMonth ? "text-gray-300 cursor-not-allowed" : ""}
                    ${d.inMonth && !isPast && !isSelected && !d.inRange ? "hover:bg-gray-50 cursor-pointer" : ""}
                    ${d.inRange && !isSelected ? "bg-blue-50" : ""}
                    ${isSelected ? "bg-blue-600 text-white rounded-xl z-10" : ""}
                    ${d.isToday && !isSelected ? "font-bold" : ""}
                  `}
                >
                  <span
                    className={`
                      ${d.inMonth && !isPast && isOff && !isSelected ? "text-rose-500" : ""}
                      ${isSelected ? "text-white font-bold" : ""}
                    `}
                  >
                    {d.day}
                  </span>
                  {d.holiday && d.inMonth && (
                    <span
                      className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-rose-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              공휴일
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="text-rose-500 font-semibold">일/토</span>
              주말
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-4 h-2 rounded bg-blue-600" />
              선택
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-4 h-2 rounded bg-blue-50 border border-blue-100" />
              범위
            </div>
          </div>
        </div>
      </div>

      {/* 3. 일수 계산 결과 */}
      {startDate && (halfDay || endDate) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-gray-800">
              사용 일수
            </span>
            <span className="text-[24px] font-bold text-blue-600">
              {halfDay ? "0.5" : days}
              <span className="text-[13px] text-gray-400 ml-0.5">일</span>
            </span>
          </div>

          {!halfDay && excludedInfo.total > 0 && (
            <div className="space-y-1.5 text-[12px] border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>신청 기간</span>
                <span>{excludedInfo.total}일</span>
              </div>
              {excludedInfo.weekends > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>주말 제외</span>
                  <span className="text-blue-500 font-medium">
                    -{excludedInfo.weekends}일
                  </span>
                </div>
              )}
              {excludedInfo.holidayNames.length > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>
                    공휴일 제외
                    <span className="text-gray-400 ml-1">
                      ({excludedInfo.holidayNames.join(", ")})
                    </span>
                  </span>
                  <span className="text-rose-500 font-medium">
                    -{excludedInfo.holidayNames.length}일
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-1.5">
                <span>실제 사용</span>
                <span>{days}일</span>
              </div>
            </div>
          )}

          {overLimit && (
            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="text-[12px] font-semibold text-rose-700">
                잔여 일수({remaining}일)를 초과합니다
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. 사유 + 제출 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-2">
            사유
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="휴가 사유를 입력해 주세요"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[12px] text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`flex-1 h-12 rounded-xl text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${
              canSubmit
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                휴가 신청
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 h-12 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
