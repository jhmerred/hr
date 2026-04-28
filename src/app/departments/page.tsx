import { getDepartments } from "@/lib/api";
import { Department } from "@/lib/types";
import { DepartmentList } from "@/components/departments/department-list";

export default async function DepartmentsPage() {
  const data = await getDepartments().catch(() => ({ rows: [] }));
  const departments: Department[] = data.rows || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          부서 관리
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          부서를 추가하고 관리합니다
        </p>
      </div>
      <DepartmentList departments={departments} />
    </div>
  );
}
