import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { EmployeeTable } from "@/components/employees/employee-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";

export default async function EmployeesPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            직원 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            전체 {employees.length}명의 직원을 관리합니다
          </p>
        </div>
        <Link
          href="/employees/new"
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          직원 등록
        </Link>
      </div>
      <EmployeeTable employees={employees} departments={departments} />
    </div>
  );
}
