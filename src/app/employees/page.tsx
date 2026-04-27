import { getEmployees, getDepartments } from "@/lib/api";
import { Employee, Department } from "@/lib/types";
import { EmployeeTable } from "@/components/employees/employee-table";
import { Button } from "@/components/ui/button";
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
          <h1 className="text-3xl font-bold">직원 관리</h1>
          <p className="text-muted-foreground mt-1">
            전체 직원 {employees.length}명
          </p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            직원 등록
          </Button>
        </Link>
      </div>
      <EmployeeTable employees={employees} departments={departments} />
    </div>
  );
}
