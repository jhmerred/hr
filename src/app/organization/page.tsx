import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { Building2, Users } from "lucide-react";
import Link from "next/link";

const avatarColors = [
  "avatar-blue", "avatar-purple", "avatar-green", "avatar-amber", "avatar-rose", "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const deptColors = [
  { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  { bg: "from-amber-400 to-orange-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
];

export default async function OrganizationPage() {
  const [employeesData, departmentsData] = await Promise.all([
    getEmployees().catch(() => ({ rows: [] })),
    getDepartments().catch(() => ({ rows: [] })),
  ]);

  const employees: Employee[] = employeesData.rows || [];
  const departments: Department[] = departmentsData.rows || [];

  const deptGroups = departments.map((dept, i) => ({
    ...dept,
    color: deptColors[i % deptColors.length],
    members: employees
      .filter((e) => e.department_id === dept.id)
      .sort((a, b) => {
        const order: Record<string, number> = { 팀장: 0, 매니저: 1, 시니어: 2, 주니어: 3, 사원: 4 };
        return (order[a.position] ?? 5) - (order[b.position] ?? 5);
      }),
  }));

  const statusBadge: Record<string, { label: string; cls: string }> = {
    active: { label: "재직", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    inactive: { label: "퇴직", cls: "text-gray-500 bg-gray-50 border-gray-200" },
    on_leave: { label: "휴직", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">조직도</h1>
        <p className="text-[13px] text-gray-400 mt-1">
          {departments.length}개 부서 &middot; {employees.length}명
        </p>
      </div>

      {/* 회사 루트 */}
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-4 shadow-xl shadow-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[15px]">우리 회사</p>
              <p className="text-[12px] text-blue-200">
                {employees.length}명 &middot; {departments.length}개 부서
              </p>
            </div>
          </div>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-blue-300 to-gray-200" />
        <div className="w-[80%] max-w-[800px] h-px bg-gray-200" />
      </div>

      {/* 부서 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deptGroups.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* 부서 헤더 */}
            <div className={`bg-gradient-to-r ${dept.color.bg} p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[14px] text-white">
                    {dept.name}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {dept.members.length}명
                  </p>
                </div>
              </div>
            </div>

            {/* 멤버 목록 */}
            <div className="divide-y divide-gray-50">
              {dept.members.length === 0 ? (
                <p className="text-[12px] text-gray-400 p-5 text-center">
                  구성원이 없습니다
                </p>
              ) : (
                dept.members.map((emp, idx) => {
                  const badge = statusBadge[emp.status] || statusBadge.active;
                  const isLeader = emp.position === "팀장";
                  return (
                    <Link
                      key={emp.id}
                      href={`/employees/${emp.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors group"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isLeader
                            ? `bg-gradient-to-br ${dept.color.bg} text-white shadow-sm`
                            : getAvatarColor(emp.name)
                        }`}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                            {emp.name}
                          </span>
                          {isLeader && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dept.color.light} ${dept.color.text}`}>
                              LEAD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
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
