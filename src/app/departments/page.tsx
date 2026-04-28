import { getDepartments } from "@/lib/api";
import { Department } from "@/lib/types";
import { DepartmentList } from "@/components/departments/department-list";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function DepartmentsPage() {
  const result = await safeParallel(
    () => getDepartments(),
  );

  if (!result.ok) {
    if (result.isTokenError) redirect("/api/auth/login");
    return <ErrorState />;
  }

  const [data] = result.results;
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
