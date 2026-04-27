import { getLeaveRequest, getEmployees, getLeaveTypes } from "@/lib/api";
import { Employee, LeaveType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "outline" },
  approved: { label: "승인", variant: "default" },
  rejected: { label: "반려", variant: "destructive" },
  cancelled: { label: "취소", variant: "secondary" },
};

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request, employeesData, leaveTypesData] = await Promise.all([
    getLeaveRequest(id),
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveTypes().catch(() => ({ rows: [] })),
  ]);

  const employees: Employee[] = employeesData.rows || [];
  const leaveTypes: LeaveType[] = leaveTypesData.rows || [];

  const empName =
    employees.find((e) => e.id === request.employee_id)?.name || "-";
  const ltName =
    leaveTypes.find((lt) => lt.id === request.leave_type_id)?.name || "-";
  const status = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">휴가 상세</h1>
        <p className="text-muted-foreground mt-1">휴가 신청 상세 정보</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            휴가 정보
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">직원</p>
              <p className="font-medium">
                <Link
                  href={`/employees/${request.employee_id}`}
                  className="text-primary hover:underline"
                >
                  {empName}
                </Link>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">휴가 유형</p>
              <p className="font-medium">{ltName}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">시작일</p>
              <p className="font-medium">{request.start_date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">종료일</p>
              <p className="font-medium">{request.end_date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">사용 일수</p>
              <p className="font-medium">{request.days}일</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">사유</p>
            <p className="mt-1">{request.reason || "-"}</p>
          </div>

          {request.reject_reason && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">반려 사유</p>
                <p className="mt-1 text-red-600">{request.reject_reason}</p>
              </div>
            </>
          )}

          {request.approved_at && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">처리 일시</p>
                <p className="mt-1">{new Date(request.approved_at).toLocaleString("ko-KR")}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>신청일: {new Date(request.created_at).toLocaleString("ko-KR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/leave"
        className="text-sm text-primary hover:underline inline-block"
      >
        ← 목록으로 돌아가기
      </Link>
    </div>
  );
}
