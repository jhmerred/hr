import { getDepartments, getEmployees } from "@/lib/api";
import { Department, Employee } from "@/lib/types";
import { DepartmentList } from "@/components/departments/department-list";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function DepartmentsPage() {
  const result = await safeParallel(
    () => getDepartments(),
    () => getEmployees(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [deptData, empData] = result.results;
  const departments: Department[] = deptData.rows || [];
  const employees: Employee[] = empData.rows || [];

  // 부서별 인원 수
  const deptCounts = new Map<string, number>();
  employees.forEach((e) => {
    if (e.department_id) {
      deptCounts.set(e.department_id, (deptCounts.get(e.department_id) || 0) + 1);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">부서 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          {departments.length}개 부서 · {employees.length}명
        </p>
      </div>
      <DepartmentList departments={departments} deptCounts={deptCounts} />
    </div>
  );
}
