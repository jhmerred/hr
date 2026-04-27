import { getEmployees, getLeaveRequests, getDepartments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Clock, Building2 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [employeesData, requestsData, departmentsData] = await Promise.all([
    getEmployees().catch(() => ({ rows: [] })),
    getLeaveRequests().catch(() => ({ rows: [] })),
    getDepartments().catch(() => ({ rows: [] })),
  ]);

  const employees = employeesData.rows || [];
  const requests = requestsData.rows || [];
  const departments = departmentsData.rows || [];

  const activeEmployees = employees.filter(
    (e: { status: string }) => e.status === "active"
  );
  const pendingRequests = requests.filter(
    (r: { status: string }) => r.status === "pending"
  );
  const approvedThisMonth = requests.filter((r: { status: string; start_date: string }) => {
    const now = new Date();
    const start = new Date(r.start_date);
    return (
      r.status === "approved" &&
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">HR 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">전체 직원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              총 {employees.length}명 중 활성
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">대기 중 휴가</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">승인 대기 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">이번 달 휴가</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">승인된 휴가</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">부서</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">운영 중인 부서</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              대기 중인 휴가 신청
              <Link
                href="/leave"
                className="text-sm font-normal text-primary hover:underline"
              >
                전체 보기
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                대기 중인 신청이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map(
                  (req: {
                    id: string;
                    employee_id: string;
                    start_date: string;
                    end_date: string;
                    days: number;
                    status: string;
                  }) => (
                    <Link
                      key={req.id}
                      href={`/leave/${req.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {req.start_date} ~ {req.end_date}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.days}일
                        </p>
                      </div>
                      <Badge variant="outline">대기</Badge>
                    </Link>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              부서별 인원
              <Link
                href="/departments"
                className="text-sm font-normal text-primary hover:underline"
              >
                전체 보기
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                등록된 부서가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {departments.map(
                  (dept: { id: string; name: string }) => {
                    const count = employees.filter(
                      (e: { department_id: string }) =>
                        e.department_id === dept.id
                    ).length;
                    return (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <span className="text-sm font-medium">{dept.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {count}명
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
