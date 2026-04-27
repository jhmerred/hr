"use client";

import { Department, Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createEmployeeAction, updateEmployeeAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export function EmployeeForm({
  departments,
  employee,
}: {
  departments: Department[];
  employee?: Employee;
}) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          action={async (formData) => {
            if (employee) {
              await updateEmployeeAction(employee.id, formData);
            } else {
              await createEmployeeAction(formData);
            }
            router.push("/employees");
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={employee?.name || ""}
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={employee?.email || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={employee?.phone || ""}
              />
            </div>
            <div>
              <Label htmlFor="position">직책</Label>
              <Input
                id="position"
                name="position"
                required
                placeholder="사원, 대리, 과장, 부장..."
                defaultValue={employee?.position || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hire_date">입사일</Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                required
                defaultValue={employee?.hire_date || ""}
              />
            </div>
            <div>
              <Label htmlFor="department_id">부서</Label>
              <select
                id="department_id"
                name="department_id"
                required
                defaultValue={employee?.department_id || ""}
                className="w-full border rounded-md px-3 py-2 text-sm h-9"
              >
                <option value="">부서 선택</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {employee && (
            <div>
              <Label htmlFor="status">상태</Label>
              <select
                id="status"
                name="status"
                defaultValue={employee.status}
                className="w-full border rounded-md px-3 py-2 text-sm h-9"
              >
                <option value="active">재직</option>
                <option value="inactive">퇴직</option>
                <option value="on_leave">휴직</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {employee ? "수정" : "등록"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
