"use client";

import { useState, useMemo } from "react";
import { Holiday, getMonthCalendar, formatLocalDate } from "@/lib/holidays";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getInitial } from "@/lib/constants";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const days = useMemo(() => getMonthCalendar(year, month, holidays), [year, month, holidays]);

  const leaveByDate = useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();
    requests
      .filter((r) => r.status === "approved" || r.status === "pending")
      .forEach((r) => {
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        const cur = new Date(start);
        while (cur <= end) {
          const dateStr = formatLocalDate(cur);
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
    setSelectedDate(null);
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(null);
  };

  const monthHolidays = holidays.filter((h) => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalWorkDays = days.filter(
    (d) => d.isCurrentMonth && !d.isWeekend && !d.holiday
  ).length;
  const totalOffDays = days.filter(
    (d) => d.isCurrentMonth && (d.isWeekend || d.holiday)
  ).length;

  // 선택된 날짜의 상세
  const selectedLeaves = selectedDate ? (leaveByDate.get(selectedDate) || []) : [];
  const selectedHoliday = selectedDate
    ? holidays.find((h) => h.date === selectedDate)
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* 캘린더 (3/4) */}
        <div className="xl:col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goMonth(-1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={() => goMonth(1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              <h2 className="text-base font-bold text-gray-900 ml-2">
                {year}년 {month + 1}월
              </h2>
              <button
                onClick={goToday}
                className="ml-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-md px-2.5 py-1 hover:bg-gray-50 transition-colors"
              >
                오늘
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>근무 <strong className="text-gray-700">{totalWorkDays}</strong>일</span>
              <span>휴일 <strong className="text-gray-700">{totalOffDays}</strong>일</span>
              <span>공휴일 <strong className="text-gray-700">{monthHolidays.length}</strong>건</span>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={`text-center text-xs font-semibold py-2.5 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-gray-400" : "text-gray-400"
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const dayLeaves = leaveByDate.get(d.date) || [];
              const isSelected = selectedDate === d.date;
              const hasContent = d.holiday || dayLeaves.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => d.isCurrentMonth && setSelectedDate(d.date === selectedDate ? null : d.date)}
                  className={`
                    min-h-[110px] p-2 text-left border-b border-r border-gray-100 transition-colors relative
                    ${d.isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50/30"}
                    ${isSelected ? "bg-gray-100 ring-1 ring-gray-300 ring-inset" : ""}
                    ${d.isToday ? "bg-gray-50" : ""}
                    ${i % 7 === 6 ? "border-r-0" : ""}
                  `}
                >
                  {/* 날짜 번호 */}
                  <div className="mb-1">
                    <span
                      className={`text-sm leading-none inline-flex items-center justify-center ${
                        !d.isCurrentMonth
                          ? "text-gray-300"
                          : d.isToday
                          ? "w-7 h-7 rounded-full bg-gray-900 text-white font-bold text-xs"
                          : d.dayOfWeek === 0 || d.holiday
                          ? "text-red-500 font-medium"
                          : d.dayOfWeek === 6
                          ? "text-gray-400 font-medium"
                          : "text-gray-800 font-medium"
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>

                  {/* 공휴일 */}
                  {d.holiday && d.isCurrentMonth && (
                    <div className="mb-0.5">
                      <span className="text-xs text-red-500 font-medium block truncate">
                        {d.holiday.name}
                      </span>
                    </div>
                  )}

                  {/* 휴가 dots */}
                  {d.isCurrentMonth && dayLeaves.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayLeaves.slice(0, 2).map((req, ri) => {
                        const emp = empMap.get(req.employee_id);
                        return (
                          <div
                            key={ri}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${
                              req.status === "approved"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                            title={`${emp?.name} - ${ltMap.get(req.leave_type_id) || ""}`}
                          >
                            {emp?.name} {ltMap.get(req.leave_type_id)?.charAt(0) || ""}
                          </div>
                        );
                      })}
                      {dayLeaves.length > 2 && (
                        <span className="text-xs text-gray-400">+{dayLeaves.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* 컨텐츠 인디케이터 */}
                  {hasContent && !d.holiday && dayLeaves.length === 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <span className="w-1 h-1 rounded-full bg-gray-300 block" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 사이드 패널 (1/4) */}
        <div className="xl:col-span-1 space-y-4">
          {/* 선택된 날짜 상세 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {selectedDate
                  ? `${new Date(selectedDate).getMonth() + 1}월 ${new Date(selectedDate).getDate()}일`
                  : "날짜를 선택하세요"}
              </h3>
            </div>
            <div className="p-4">
              {!selectedDate ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  캘린더에서 날짜를 클릭하면<br />상세 정보가 표시됩니다
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedHoliday && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span className="text-xs font-medium text-red-700">
                        {selectedHoliday.name}
                      </span>
                    </div>
                  )}
                  {selectedLeaves.length === 0 && !selectedHoliday && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      이 날짜에 등록된 일정이 없습니다
                    </p>
                  )}
                  {selectedLeaves.map((req, i) => {
                    const emp = empMap.get(req.employee_id);
                    return (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {getInitial(emp?.name || "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{emp?.name}</p>
                          <p className="text-xs text-gray-400">
                            {ltMap.get(req.leave_type_id) || "-"} ·{" "}
                            <span className={req.status === "approved" ? "text-green-600" : "text-amber-600"}>
                              {req.status === "approved" ? "승인" : "대기"}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 이번 달 공휴일 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {month + 1}월 공휴일
              </h3>
            </div>
            <div className="p-4">
              {monthHolidays.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  이번 달 공휴일이 없습니다
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthHolidays.map((h, i) => {
                    const d = new Date(h.date);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(h.date)}
                        className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-gray-900 leading-none">
                            {d.getDate()}
                          </span>
                          <span className="text-xs text-gray-400 leading-none mt-0.5">
                            {WEEKDAYS[d.getDay()]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {h.name}
                          </p>
                          {h.type === "substitute" && (
                            <p className="text-xs text-amber-500">대체공휴일</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
