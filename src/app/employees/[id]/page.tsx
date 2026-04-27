import { getEmployee, getDepartments, getLeaveBalances, getLeaveRequests } from "@/lib/api";
import { Department, LeaveBalance, LeaveRequest } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [employee, departmentsData, balancesData, requestsData] =
    await Promise.all([
      getEmployee(id),
      getDepartments().catch(() => ({ rows: [] })),
      getLeaveBalances({ employee_id: id }).catch(() => ({ rows: [] })),
      getLeaveRequests({ employee_id: id }).catch(() => ({ rows: [] })),
    ]);

  const departments: Department[] = departmentsData.rows || [];
  const balances: LeaveBalance[] = balancesData.rows || [];
  const requests: LeaveRequest[] = requestsData.rows || [];

  const currentYear = new Date().getFullYear();
  const currentBalances = balances.filter((b) => b.year === currentYear);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">직원 상세</h1>
        <p className="text-muted-foreground mt-1">{employee.name}</p>
      </div>

      <EmployeeForm departments={departments} employee={employee} />

      <Card>
        <CardHeader>
          <CardTitle>{currentYear}년 잔여 휴가</CardTitle>
        </CardHeader>
        <CardContent>
          {currentBalances.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              잔여 휴가 데이터가 없습니다.{" "}
              <Link href="/balances" className="text-primary hover:underline">
                잔여 휴가 페이지
              </Link>
              에서 초기화해 주세요.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>휴가 유형</TableHead>
                  <TableHead>총 일수</TableHead>
                  <TableHead>사용</TableHead>
                  <TableHead>잔여</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBalances.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.leave_type_id}
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 휴가 신청</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              휴가 신청 기록이 없습니다
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>기간</TableHead>
                  <TableHead>일수</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.slice(0, 10).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/leave/${r.id}`}
                        className="text-primary hover:underline"
                      >
                        {r.start_date} ~ {r.end_date}
                      </Link>
                    </TableCell>
                    <TableCell>{r.days}일</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "default"
                            : r.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {r.status === "pending"
                          ? "대기"
                          : r.status === "approved"
                          ? "승인"
                          : r.status === "rejected"
                          ? "반려"
                          : "취소"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
