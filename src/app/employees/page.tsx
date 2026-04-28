import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { EmployeeTable } from "@/components/employees/employee-table";
import { redirect } from "next/navigation";
import { safeParallel } from "@/lib/safe-fetch";
import { ErrorState } from "@/components/error-state";
import { EmployeeCreateButton } from "@/components/employees/employee-create-button";

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
          <h1 className="text-xl font-bold text-gray-900">직원 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            전체 {employees.length}명의 직원을 관리합니다
          </p>
        </div>
        <EmployeeCreateButton departments={departments} />
      </div>
      <EmployeeTable employees={employees} departments={departments} />
    </div>
  );
}
