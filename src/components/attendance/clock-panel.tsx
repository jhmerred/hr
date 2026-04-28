"use client";

import { useState, useMemo } from "react";
import { Employee, AttendanceRecord } from "@/lib/types";
import { clockInAction, clockOutAction } from "@/app/actions";
import { LogIn, LogOut, Clock, Search } from "lucide-react";
import { getInitial } from "@/lib/constants";

export function ClockPanel({
  employees,
  todayRecords,
}: {
  employees: Employee[];
  todayRecords: AttendanceRecord[];
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const recordMap = useMemo(
    () => new Map(todayRecords.map((r) => [r.employee_id, r])),
    [todayRecords]
  );

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "active"),
    [employees]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return activeEmployees;
    const q = search.toLowerCase();
    return activeEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
  }, [activeEmployees, search]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const clockedIn = todayRecords.filter((r) => r.clock_in && !r.clock_out).length;
  const clockedOut = todayRecords.filter((r) => r.clock_in && r.clock_out).length;

  async function handleClockIn(employeeId: string) {
    setLoading(employeeId);
    try {
      await clockInAction(employeeId);
    } finally {
      setLoading(null);
    }
  }

  async function handleClockOut(record: AttendanceRecord) {
    setLoading(record.employee_id);
    try {
      await clockOutAction(record.id, record.clock_in);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">출퇴근 기록</h2>
              <p className="text-xs text-gray-400">현재 {timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600 font-semibold">
              근무 중 {clockedIn}명
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              퇴근 {clockedOut}명
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="직원 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          />
        </div>
      </div>

      <div className="px-5 py-3 max-h-[320px] overflow-y-auto">
        <div className="space-y-1">
          {filtered.map((emp) => {
            const record = recordMap.get(emp.id);
            const isWorking = record && record.clock_in && !record.clock_out;
            const isDone = record && record.clock_in && record.clock_out;
            const isLoading = loading === emp.id;

            return (
              <div
                key={emp.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {getInitial(emp.name)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {emp.name}
                    </p>
                    <p className="text-xs text-gray-400">{emp.position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">
                        {record.clock_in} - {record.clock_out}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                        퇴근 완료
                      </span>
                    </div>
                  ) : isWorking ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-mono font-medium">
                        {record.clock_in} 출근
                      </span>
                      <button
                        onClick={() => handleClockOut(record)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <LogOut className="h-3 w-3" />
                        )}
                        퇴근
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClockIn(emp.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <LogIn className="h-3 w-3" />
                      )}
                      출근
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">
              검색 결과가 없습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
