import { getAuthUser, requireAdmin } from "@/lib/auth";
import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import { getInitial } from "@/lib/constants";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function OrganizationPage() {
  const user = await getAuthUser();
  requireAdmin(user);

  const result = await safeParallel(
    () => getEmployees(),
    () => getDepartments(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [employeesData, departmentsData] = result.results;
  const employees: Employee[] = employeesData.rows || [];
  const departments: Department[] = departmentsData.rows || [];

  const deptGroups = departments.map((dept) => ({
    ...dept,
    members: employees
      .filter((e) => e.department_id === dept.id)
      .sort((a, b) => {
        const order: Record<string, number> = { 팀장: 0, 매니저: 1, 시니어: 2, 주니어: 3, 사원: 4 };
        return (order[a.position] ?? 5) - (order[b.position] ?? 5);
      }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">조직도</h1>
        <p className="text-sm text-gray-500 mt-1">
          {departments.length}개 부서 &middot; {employees.length}명
        </p>
      </div>

      {/* 회사 루트 */}
      <div className="flex flex-col items-center">
        <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">우리 회사</p>
              <p className="text-xs text-gray-500">
                {employees.length}명 &middot; {departments.length}개 부서
              </p>
            </div>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="w-[80%] max-w-[800px] h-px bg-gray-200" />
      </div>

      {/* 부서 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptGroups.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* 부서 헤더 */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {dept.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dept.members.length}명
                  </p>
                </div>
              </div>
            </div>

            {/* 멤버 목록 */}
            <div className="divide-y divide-gray-100">
              {dept.members.length === 0 ? (
                <p className="text-xs text-gray-400 p-5 text-center">
                  구성원이 없습니다
                </p>
              ) : (
                dept.members.map((emp) => {
                  const isLeader = emp.position === "팀장";
                  return (
                    <Link
                      key={emp.id}
                      href={`/employees/${emp.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {getInitial(emp.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                            {emp.name}
                          </span>
                          {isLeader && (
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              LEAD
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {emp.position} &middot; {emp.email}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
