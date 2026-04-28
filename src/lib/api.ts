import { cookies } from "next/headers";

const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
const API_KEY = process.env.APPHUB_API_KEY || "";
const APP_SLUG = process.env.APPHUB_APP_SLUG || "hr";

async function getSSOCookie(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const sso = cookieStore.get("_apphub_sso");
    return sso ? `_apphub_sso=${sso.value}` : "";
  } catch {
    return "";
  }
}

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
  const ssoCookie = await getSSOCookie();

  // Gateway 경로: /gw/{slug}/{table}[/{id}]
  const path = `/gw/${APP_SLUG}/${table}${id ? `/${id}` : ""}`;
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Api-Key": API_KEY,
  };
  if (ssoCookie) {
    headers["Cookie"] = ssoCookie;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[api] ${res.status} ${method} ${path}: ${text.substring(0, 200)}`);
    throw new Error(`API ${res.status}`);
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
export const deleteEmployee = (id: string) => gw("employees", { method: "DELETE", id });

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
