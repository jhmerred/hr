export interface Department {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  hire_date: string;
  status: "active" | "inactive" | "on_leave";
  department_id: string;
  department?: Department;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: string;
  name: string;
  description: string;
  default_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  employee_id: string;
  employee?: Employee;
  leave_type_id: string;
  leave_type?: LeaveType;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reject_reason: string;
  approved_at: string;
  employee_id: string;
  employee?: Employee;
  leave_type_id: string;
  leave_type?: LeaveType;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  work_minutes: number;
  overtime_minutes: number;
  status: "normal" | "late" | "early_leave" | "overtime" | "leave" | "absent";
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  rows: T[];
  total: number;
  page: number;
  per: number;
}
