"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

// Departments
export async function createDepartmentAction(formData: FormData) {
  await api.createDepartment({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    is_active: true,
  });
  revalidatePath("/departments");
}

export async function updateDepartmentAction(id: string, formData: FormData) {
  await api.updateDepartment(id, {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  });
  revalidatePath("/departments");
}

export async function deleteDepartmentAction(id: string) {
  await api.deleteDepartment(id);
  revalidatePath("/departments");
}

// Employees
export async function createEmployeeAction(formData: FormData) {
  await api.createEmployee({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    position: formData.get("position") as string,
    hire_date: formData.get("hire_date") as string,
    department_id: formData.get("department_id") as string,
    status: "active",
  });
  revalidatePath("/employees");
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  await api.updateEmployee(id, {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    position: formData.get("position") as string,
    hire_date: formData.get("hire_date") as string,
    department_id: formData.get("department_id") as string,
    status: formData.get("status") as string,
  });
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
}

export async function deleteEmployeeAction(id: string) {
  await api.deleteEmployee(id);
  revalidatePath("/employees");
}

// Leave Types
export async function createLeaveTypeAction(formData: FormData) {
  await api.createLeaveType({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    default_days: Number(formData.get("default_days")),
    is_active: true,
  });
  revalidatePath("/leave-types");
}

export async function updateLeaveTypeAction(id: string, formData: FormData) {
  await api.updateLeaveType(id, {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    default_days: Number(formData.get("default_days")),
  });
  revalidatePath("/leave-types");
}

export async function deleteLeaveTypeAction(id: string) {
  await api.deleteLeaveType(id);
  revalidatePath("/leave-types");
}

// Leave Requests
export async function createLeaveRequestAction(formData: FormData) {
  await api.createLeaveRequest({
    employee_id: formData.get("employee_id") as string,
    leave_type_id: formData.get("leave_type_id") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    days: Number(formData.get("days")),
    reason: formData.get("reason") as string,
    status: "pending",
    reject_reason: "",
    approved_at: "",
  });
  revalidatePath("/leave");
  revalidatePath("/dashboard");
}

export async function approveLeaveRequestAction(id: string) {
  const request = await api.getLeaveRequest(id);

  await api.updateLeaveRequest(id, {
    status: "approved",
    approved_at: new Date().toISOString(),
  });

  // Update leave balance
  const balances = await api.getLeaveBalances({
    employee_id: request.employee_id,
    leave_type_id: request.leave_type_id,
    year: String(new Date().getFullYear()),
  });

  if (balances.rows && balances.rows.length > 0) {
    const balance = balances.rows[0];
    await api.updateLeaveBalance(balance.id, {
      used_days: balance.used_days + request.days,
      remaining_days: balance.remaining_days - request.days,
    });
  }

  revalidatePath("/leave");
  revalidatePath("/dashboard");
  revalidatePath("/balances");
}

export async function rejectLeaveRequestAction(id: string, formData: FormData) {
  await api.updateLeaveRequest(id, {
    status: "rejected",
    reject_reason: formData.get("reject_reason") as string,
    approved_at: new Date().toISOString(),
  });
  revalidatePath("/leave");
  revalidatePath("/dashboard");
}

// 근속 기반 연차 일수 계산 (한국 근로기준법)
function calcAnnualLeave(hireDate: string, year: number): number {
  const hire = new Date(hireDate);
  const yearStart = new Date(year, 0, 1);
  const months = (yearStart.getFullYear() - hire.getFullYear()) * 12 + (yearStart.getMonth() - hire.getMonth());

  if (months < 12) {
    // 1년 미만: 매월 1일씩 최대 11일
    return Math.min(Math.max(months, 0), 11);
  }

  // 1년 이상: 15일 + 2년마다 1일 추가 (최대 25일)
  const yearsWorked = Math.floor(months / 12);
  const bonus = Math.floor(Math.max(yearsWorked - 1, 0) / 2);
  return Math.min(15 + bonus, 25);
}

// Leave Balances
export async function initializeBalancesAction(year: number) {
  const [employeesData, leaveTypesData] = await Promise.all([
    api.getEmployees(),
    api.getLeaveTypes(),
  ]);

  const employees = employeesData.rows || [];
  const leaveTypes = leaveTypesData.rows || [];

  // 연차 타입 찾기
  const annualType = leaveTypes.find(
    (lt: { name: string }) => lt.name === "연차"
  );

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      if (!lt.is_active) continue;

      // 연차는 근속 기반으로 계산
      let days = lt.default_days;
      if (annualType && lt.id === annualType.id && emp.hire_date) {
        days = calcAnnualLeave(emp.hire_date, year);
      }

      await api.createLeaveBalance({
        employee_id: emp.id,
        leave_type_id: lt.id,
        year,
        total_days: days,
        used_days: 0,
        remaining_days: days,
      });
    }
  }

  revalidatePath("/balances");
}

// Attendance
export async function clockInAction(employeeId: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const date = `${y}-${m}-${d}`;
  const time = now.toTimeString().slice(0, 5);
  const isLate = time > "09:00";

  await api.createAttendanceRecord({
    employee_id: employeeId,
    date,
    clock_in: time,
    clock_out: "",
    work_minutes: 0,
    overtime_minutes: 0,
    status: isLate ? "late" : "normal",
    note: isLate ? "지각" : "",
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function clockOutAction(recordId: string, clockIn: string) {
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);

  const [inH, inM] = clockIn.split(":").map(Number);
  const [outH, outM] = time.split(":").map(Number);
  const workMin = (outH * 60 + outM) - (inH * 60 + inM) - 60;
  const overtimeMin = Math.max(0, workMin - 480);

  await api.updateAttendanceRecord(recordId, {
    clock_out: time,
    work_minutes: Math.max(0, workMin),
    overtime_minutes: overtimeMin,
    status: overtimeMin > 0 ? "overtime" : "normal",
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
