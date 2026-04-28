import { getDepartments } from "@/lib/api";
import { Department } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function NewEmployeePage() {
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">직원 등록</h1>
        <p className="text-sm text-gray-500 mt-1">새 직원을 등록합니다</p>
      </div>
      <EmployeeForm departments={departments} />
    </div>
  );
}
