import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import Link from "next/link";

export default async function OrganizationPage() {
  const [employeesData, departmentsData] = await Promise.all([
    getEmployees().catch(() => ({ rows: [] })),
    getDepartments().catch(() => ({ rows: [] })),
  ]);

  const employees: Employee[] = employeesData.rows || [];
  const departments: Department[] = departmentsData.rows || [];

  const deptGroups = departments.map((dept) => ({
    ...dept,
    members: employees
      .filter((e) => e.department_id === dept.id)
      .sort((a, b) => {
        const order: Record<string, number> = {
          팀장: 0,
          매니저: 1,
          시니어: 2,
          주니어: 3,
          사원: 4,
        };
        return (order[a.position] ?? 5) - (order[b.position] ?? 5);
      }),
  }));

  const statusBadge: Record<string, { label: string; class: string }> = {
    active: { label: "재직", class: "bg-green-50 text-green-700 border-green-200" },
    inactive: { label: "퇴직", class: "bg-gray-50 text-gray-500 border-gray-200" },
    on_leave: { label: "휴직", class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">조직도</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          부서별 구성원 현황 ({employees.length}명)
        </p>
      </div>

      {/* 회사 루트 */}
      <div className="flex flex-col items-center mb-4">
        <div className="bg-blue-600 text-white rounded-xl px-6 py-3 shadow-md">
          <p className="font-bold text-sm">우리 회사</p>
          <p className="text-xs text-blue-200">{employees.length}명 / {departments.length}개 부서</p>
        </div>
        <div className="w-px h-6 bg-gray-300" />
        <div className="w-3/4 h-px bg-gray-300" />
      </div>

      {/* 부서별 트리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptGroups.map((dept) => (
          <Card key={dept.id} className="border-0 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{dept.name}</p>
                  <p className="text-xs text-gray-500">{dept.members.length}명</p>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              {dept.members.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">
                  구성원이 없습니다
                </p>
              ) : (
                <div className="divide-y">
                  {dept.members.map((emp) => {
                    const badge = statusBadge[emp.status] || statusBadge.active;
                    return (
                      <Link
                        key={emp.id}
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {emp.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {emp.position}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">
                            {emp.email}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.class}`}
                        >
                          {badge.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
