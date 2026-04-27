import { getDepartments } from "@/lib/api";
import { Department } from "@/lib/types";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const data = await getDepartments().catch(() => ({ rows: [] }));
  const departments: Department[] = data.rows || [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">직원 등록</h1>
        <p className="text-muted-foreground mt-1">새 직원을 등록합니다</p>
      </div>
      <EmployeeForm departments={departments} />
    </div>
  );
}
