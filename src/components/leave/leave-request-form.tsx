"use client";

import { useState, useMemo } from "react";
import { Employee, LeaveType, LeaveBalance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createLeaveRequestAction } from "@/app/actions";
import { useRouter } from "next/navigation";

function calcBusinessDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

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

  const days = useMemo(
    () => calcBusinessDays(startDate, endDate),
    [startDate, endDate]
  );

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

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          action={async (formData) => {
            formData.set("days", String(days));
            await createLeaveRequestAction(formData);
            router.push("/leave");
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="employee_id">직원</Label>
            <select
              id="employee_id"
              name="employee_id"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm h-9"
            >
              <option value="">직원 선택</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="leave_type_id">��가 유형</Label>
            <div className="flex items-center gap-3">
              <select
                id="leave_type_id"
                name="leave_type_id"
                required
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 text-sm h-9"
              >
                <option value="">유형 선택</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
              {remaining !== null && (
                <Badge variant={remaining <= 3 ? "destructive" : "outline"}>
                  잔여 {remaining}일
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">시작일</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">종료일</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {days > 0 && (
            <p className="text-sm">
              사용 일수: <span className="font-bold">{days}일</span> (주말 제외)
              {overLimit && (
                <span className="text-red-500 ml-2">
                  잔여 일수를 초과합니다
                </span>
              )}
            </p>
          )}

          <div>
            <Label htmlFor="reason">사유</Label>
            <Textarea
              id="reason"
              name="reason"
              required
              placeholder="휴가 사유를 입력해 주세요"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={overLimit || days === 0}
            >
              신청
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
