import { getDepartments } from "@/lib/api";
import { Department } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      <div className="flex items-center gap-3">
        <Link
          href="/employees"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">직원 등록</h1>
          <p className="text-sm text-gray-500">새 직원 정보를 입력하세요</p>
        </div>
      </div>
      <EmployeeForm departments={departments} />
    </div>
  );
}
