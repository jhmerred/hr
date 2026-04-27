"use client";

import { useState } from "react";
import { Employee, Department } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteEmployeeAction } from "@/app/actions";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "재직", variant: "default" },
  inactive: { label: "퇴직", variant: "secondary" },
  on_leave: { label: "휴직", variant: "outline" },
};

export function EmployeeTable({
  employees,
  departments,
}: {
  employees: Employee[];
  departments: Department[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department_id === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="이름 또는 이메일 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">전체 부서</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>직책</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>입사일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-16">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  직원이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => {
                const status = statusMap[emp.status] || statusMap.active;
                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <Link
                        href={`/employees/${emp.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {emp.name}
                      </Link>
                    </TableCell>
                    <TableCell>{deptMap.get(emp.department_id) || "-"}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>{emp.hire_date}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm(`${emp.name}님을 삭제하시겠습니까?`)) {
                            await deleteEmployeeAction(emp.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
