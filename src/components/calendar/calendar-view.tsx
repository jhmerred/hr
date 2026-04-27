"use client";

import { useState, useMemo } from "react";
import { Holiday, getMonthCalendar } from "@/lib/holidays";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarView({
  holidays,
  requests,
  employees,
  leaveTypes,
}: {
  holidays: Holiday[];
  requests: LeaveRequest[];
  employees: Employee[];
  leaveTypes: LeaveType[];
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const days = useMemo(() => getMonthCalendar(year, month, holidays), [year, month, holidays]);

  // 각 날짜에 해당하는 휴가 신청
  const leaveByDate = useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();
    requests.forEach((r) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      const cur = new Date(start);
      while (cur <= end) {
        const dateStr = cur.toISOString().split("T")[0];
        const arr = map.get(dateStr) || [];
        arr.push(r);
        map.set(dateStr, arr);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [requests]);

  const goMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  // 이번 달 공휴일 요약
  const monthHolidays = holidays.filter((h) => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // 이번 달 총 쉬는 날 (주말 + 공휴일, 중복 제거)
  const totalOffDays = days.filter(
    (d) => d.isCurrentMonth && (d.isWeekend || d.holiday)
  ).length;
  const totalWorkDays = days.filter(
    (d) => d.isCurrentMonth && !d.isWeekend && !d.holiday
  ).length;

  return (
    <div className="space-y-4">
      {/* 월 이동 + 요약 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goMonth(-1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-[16px] font-bold text-gray-900 min-w-[120px] text-center">
              {year}년 {month + 1}월
            </h2>
            <button
              onClick={() => goMonth(1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-gray-500">
              근무일 <span className="font-bold text-gray-900">{totalWorkDays}</span>일
            </span>
            <span className="text-gray-500">
              휴일 <span className="font-bold text-rose-500">{totalOffDays}</span>일
            </span>
            <span className="text-gray-500">
              공휴일 <span className="font-bold text-red-500">{monthHolidays.length}</span>건
            </span>
          </div>
        </div>

        {/* 달력 그리드 */}
        <div className="p-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={`text-center text-[11px] font-bold py-2 ${
                  i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
            {days.map((d, i) => {
              const dayLeaves = leaveByDate.get(d.date) || [];
              return (
                <div
                  key={i}
                  className={`min-h-[90px] p-1.5 ${
                    d.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
                  } ${d.isToday ? "ring-2 ring-blue-400 ring-inset" : ""}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-[12px] font-medium leading-none ${
                        !d.isCurrentMonth
                          ? "text-gray-300"
                          : d.isToday
                          ? "text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold"
                          : d.dayOfWeek === 0 || d.holiday
                          ? "text-rose-500"
                          : d.dayOfWeek === 6
                          ? "text-blue-500"
                          : "text-gray-700"
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>

                  {/* 공휴일 표시 */}
                  {d.holiday && d.isCurrentMonth && (
                    <div className="mb-0.5">
                      <span
                        className={`text-[9px] font-bold px-1 py-0.5 rounded block truncate ${
                          d.holiday.type === "substitute"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {d.holiday.name}
                      </span>
                    </div>
                  )}

                  {/* 휴가 표시 */}
                  {d.isCurrentMonth &&
                    dayLeaves.slice(0, 2).map((req, ri) => {
                      const emp = empMap.get(req.employee_id);
                      const empName = emp?.name || "?";
                      return (
                        <div
                          key={ri}
                          className={`text-[9px] font-medium px-1 py-0.5 rounded mb-0.5 truncate ${
                            req.status === "approved"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {empName} {ltMap.get(req.leave_type_id) || ""}
                        </div>
                      );
                    })}
                  {d.isCurrentMonth && dayLeaves.length > 2 && (
                    <span className="text-[9px] text-gray-400 pl-1">
                      +{dayLeaves.length - 2}명
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 이번 달 공휴일 목록 */}
      {monthHolidays.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3">
            <h3 className="text-[13px] font-bold text-gray-900">
              {month + 1}월 공휴일
            </h3>
          </div>
          <div className="px-5 pb-4 space-y-2">
            {monthHolidays.map((h, i) => {
              const d = new Date(h.date);
              const dayName = WEEKDAYS[d.getDay()];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div
                    className={`w-10 text-center py-1.5 rounded-lg ${
                      h.type === "substitute"
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`text-[14px] font-bold leading-none ${
                        h.type === "substitute" ? "text-orange-600" : "text-red-600"
                      }`}
                    >
                      {d.getDate()}
                    </p>
                    <p
                      className={`text-[9px] font-medium mt-0.5 ${
                        h.type === "substitute" ? "text-orange-400" : "text-red-400"
                      }`}
                    >
                      {dayName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {h.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {h.date} ({dayName}요일)
                      {h.type === "substitute" && (
                        <span className="ml-1 text-orange-500">대체공휴일</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
