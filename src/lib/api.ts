const API_BASE = process.env.API_URL || "https://hub-api.jocodingax.ai";
const APP_KEY = process.env.APP_KEY || "";
const APP_SLUG = "hr";

async function gw(
  table: string,
  options: {
    method?: string;
    id?: string;
    body?: Record<string, unknown>;
    params?: Record<string, string>;
  } = {}
) {
  const { method = "GET", id, body, params } = options;
  const url = new URL(`${API_BASE}/gw/${APP_SLUG}/${table}${id ? `/${id}` : ""}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-App-Key": APP_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

// Departments
export const getDepartments = () => gw("departments");
export const getDepartment = (id: string) => gw("departments", { id });
export const createDepartment = (data: Record<string, unknown>) =>
  gw("departments", { method: "POST", body: data });
export const updateDepartment = (id: string, data: Record<string, unknown>) =>
  gw("departments", { method: "PATCH", id, body: data });
export const deleteDepartment = (id: string) =>
  gw("departments", { method: "DELETE", id });

// Employees
export const getEmployees = (params?: Record<string, string>) =>
  gw("employees", { params });
export const getEmployee = (id: string) => gw("employees", { id });
export const createEmployee = (data: Record<string, unknown>) =>
  gw("employees", { method: "POST", body: data });
export const updateEmployee = (id: string, data: Record<string, unknown>) =>
  gw("employees", { method: "PATCH", id, body: data });
export const deleteEmployee = (id: string) =>
  gw("employees", { method: "DELETE", id });

// Leave Types
export const getLeaveTypes = () => gw("leave_types");
export const createLeaveType = (data: Record<string, unknown>) =>
  gw("leave_types", { method: "POST", body: data });
export const updateLeaveType = (id: string, data: Record<string, unknown>) =>
  gw("leave_types", { method: "PATCH", id, body: data });
export const deleteLeaveType = (id: string) =>
  gw("leave_types", { method: "DELETE", id });

// Leave Balances
export const getLeaveBalances = (params?: Record<string, string>) =>
  gw("leave_balances", { params });
export const createLeaveBalance = (data: Record<string, unknown>) =>
  gw("leave_balances", { method: "POST", body: data });
export const updateLeaveBalance = (id: string, data: Record<string, unknown>) =>
  gw("leave_balances", { method: "PATCH", id, body: data });

// Leave Requests
export const getLeaveRequests = (params?: Record<string, string>) =>
  gw("leave_requests", { params });
export const getLeaveRequest = (id: string) => gw("leave_requests", { id });
export const createLeaveRequest = (data: Record<string, unknown>) =>
  gw("leave_requests", { method: "POST", body: data });
export const updateLeaveRequest = (id: string, data: Record<string, unknown>) =>
  gw("leave_requests", { method: "PATCH", id, body: data });

// Attendance Records
export const getAttendanceRecords = (params?: Record<string, string>) =>
  gw("attendance_records", { params });
export const createAttendanceRecord = (data: Record<string, unknown>) =>
  gw("attendance_records", { method: "POST", body: data });
export const updateAttendanceRecord = (id: string, data: Record<string, unknown>) =>
  gw("attendance_records", { method: "PATCH", id, body: data });
