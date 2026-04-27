import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { EmployeeTable } from "@/components/employees/employee-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EmployeesPage() {
  const [employeesData, departmentsData] = await Promise.all([
    getEmployees().catch(() => ({ rows: [] })),
    getDepartments().catch(() => ({ rows: [] })),
  ]);

  const employees: Employee[] = employeesData.rows || [];
  const departments: Department[] = departmentsData.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
            직원 관리
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            전체 {employees.length}명의 직원을 관리합니다
          </p>
        </div>
        <Link
          href="/employees/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all"
        >
          <Plus className="h-4 w-4" />
          직원 등록
        </Link>
      </div>
      <EmployeeTable employees={employees} departments={departments} />
    </div>
  );
}
