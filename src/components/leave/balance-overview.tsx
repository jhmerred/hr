"use client";

import { useState } from "react";
import { LeaveBalance, Employee, LeaveType } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { initializeBalancesAction } from "@/app/actions";

export function BalanceOverview({
  balances,
  employees,
  leaveTypes,
}: {
  balances: LeaveBalance[];
  employees: Employee[];
  leaveTypes: LeaveType[];
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  const empMap = new Map(employees.map((e) => [e.id, e.name]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const filtered = balances.filter((b) => b.year === year);

  const handleInitialize = async () => {
    if (
      !confirm(
        `${year}년 잔여 휴가를 초기화하시겠습니까?\n모든 직원에 대해 기본 일수로 설정됩니다.`
      )
    )
      return;
    setLoading(true);
    await initializeBalancesAction(year);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border rounded-md px-3 py-1 text-sm"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">
                {filtered.length}건
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitialize}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {year}년 초기화
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>직원</TableHead>
                  <TableHead>휴가 유형</TableHead>
                  <TableHead>총 일수</TableHead>
                  <TableHead>사용</TableHead>
                  <TableHead>잔여</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      {year}년 잔여 휴가 데이터가 없습니다. 초기화 버튼을
                      눌러주세요.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {empMap.get(b.employee_id) || b.employee_id}
                      </TableCell>
                      <TableCell>
                        {ltMap.get(b.leave_type_id) || b.leave_type_id}
                      </TableCell>
                      <TableCell>{b.total_days}</TableCell>
                      <TableCell>{b.used_days}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.remaining_days <= 3 ? "destructive" : "default"
                          }
                        >
                          {b.remaining_days}일
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
