"use client";

import { useState, useMemo } from "react";
import { Employee, AttendanceRecord } from "@/lib/types";
import { clockInAction, clockOutAction } from "@/app/actions";
import { LogIn, LogOut, Clock, Search, ChevronDown, ChevronUp } from "lucide-react";
import { getInitial } from "@/lib/constants";
import { useToast } from "@/components/toast";

export function ClockPanel({
  employees,
  todayRecords,
}: {
  employees: Employee[];
  todayRecords: AttendanceRecord[];
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();

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

  const clockedIn = todayRecords.filter((r) => r.clock_in && !r.clock_out).length;
  const clockedOut = todayRecords.filter((r) => r.clock_in && r.clock_out).length;
  const notYet = activeEmployees.length - clockedIn - clockedOut;

  async function handleClockIn(employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId);
    setLoading(employeeId);
    try {
      await clockInAction(employeeId);
      toast.success(`${emp?.name || ""}님 출근이 기록되었습니다`);
    } finally {
      setLoading(null);
    }
  }

  async function handleClockOut(record: AttendanceRecord) {
    const emp = employees.find((e) => e.id === record.employee_id);
    setLoading(record.employee_id);
    try {
      await clockOutAction(record.id, record.clock_in);
      toast.success(`${emp?.name || ""}님 퇴근이 기록되었습니다`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-900">오늘의 출퇴근</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-green-600 font-medium">
                근무 중 {clockedIn}
              </span>
              <span className="text-xs text-gray-400">
                퇴근 {clockedOut}
              </span>
              <span className="text-xs text-gray-300">
                미출근 {notYet}
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <>
          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 직책으로 검색..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none bg-gray-50/50 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Employee list */}
          <div className="border-t border-gray-100">
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
              {filtered.map((emp) => {
                const record = recordMap.get(emp.id);
                const isWorking = record && record.clock_in && !record.clock_out;
                const isDone = record && record.clock_in && record.clock_out;
                const isLoading = loading === emp.id;

                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isWorking
                            ? "bg-green-100 text-green-700"
                            : isDone
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {getInitial(emp.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-400">{emp.position}</p>
                      </div>
                    </div>

                    {isDone ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {record.clock_in} → {record.clock_out}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-400 font-medium">
                          퇴근
                        </span>
                      </div>
                    ) : isWorking ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-mono font-medium">
                          {record.clock_in}~
                        </span>
                        <button
                          onClick={() => handleClockOut(record)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                );
              })}
              {filtered.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-xs text-gray-400">검색 결과가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
