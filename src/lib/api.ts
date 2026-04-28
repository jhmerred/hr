import { cookies } from "next/headers";

const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
const APP_SLUG = process.env.APPHUB_APP_SLUG || "hr";

let reqId = 0;

async function getSSOCookie(): Promise<string> {
  try {
    const store = await cookies();
    const sso = store.get("_apphub_sso");
    return sso ? `_apphub_sso=${sso.value}` : "";
  } catch {
    return "";
  }
}

// MCP JSON-RPC를 SSO 쿠키로 인증하여 호출
async function mcpCall(toolName: string, args: Record<string, unknown>) {
  const ssoCookie = await getSSOCookie();
  reqId++;

  const res = await fetch(`${API_BASE}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ssoCookie ? { Cookie: ssoCookie } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: { app_slug: APP_SLUG, ...args } },
      id: reqId,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[mcp] ${res.status}: ${text.substring(0, 200)}`);
    throw new Error(`MCP ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    console.error(`[mcp] rpc error: ${json.error.message}`);
    throw new Error(json.error.message);
  }

  // MCP tool result: { content: [{ type: "text", text: "..." }] }
  const text = json.result?.content?.[0]?.text;
  if (text) return JSON.parse(text);
  return json.result;
}

// Records CRUD via MCP
async function query(table: string, filters?: Record<string, unknown>, sort?: string) {
  const args: Record<string, unknown> = { table_name: table, action: "query" };
  if (filters) args.filters = filters;
  if (sort) args.sort = sort;
  args.per = 100;
  return mcpCall("records", args);
}

async function getById(table: string, id: string) {
  return mcpCall("records", { table_name: table, action: "query", id });
}

async function insert(table: string, data: Record<string, unknown>) {
  return mcpCall("records", { table_name: table, action: "insert", data });
}

async function update(table: string, id: string, data: Record<string, unknown>) {
  return mcpCall("records", { table_name: table, action: "update", id, data });
}

async function remove(table: string, id: string) {
  return mcpCall("records", { table_name: table, action: "delete", id });
}

// === Public API ===

// Departments
export const getDepartments = () => query("departments");
export const getDepartment = (id: string) => getById("departments", id);
export const createDepartment = (data: Record<string, unknown>) => insert("departments", data);
export const updateDepartment = (id: string, data: Record<string, unknown>) => update("departments", id, data);
export const deleteDepartment = (id: string) => remove("departments", id);

// Employees
export const getEmployees = (params?: Record<string, string>) => query("employees", params);
export const getEmployee = (id: string) => getById("employees", id);
export const createEmployee = (data: Record<string, unknown>) => insert("employees", data);
export const updateEmployee = (id: string, data: Record<string, unknown>) => update("employees", id, data);
export const deleteEmployee = (id: string) => remove("employees", id);

// Leave Types
export const getLeaveTypes = () => query("leave_types");
export const createLeaveType = (data: Record<string, unknown>) => insert("leave_types", data);
export const updateLeaveType = (id: string, data: Record<string, unknown>) => update("leave_types", id, data);
export const deleteLeaveType = (id: string) => remove("leave_types", id);

// Leave Balances
export const getLeaveBalances = (params?: Record<string, string>) => query("leave_balances", params);
export const createLeaveBalance = (data: Record<string, unknown>) => insert("leave_balances", data);
export const updateLeaveBalance = (id: string, data: Record<string, unknown>) => update("leave_balances", id, data);

// Leave Requests
export const getLeaveRequests = (params?: Record<string, string>) => query("leave_requests", params);
export const getLeaveRequest = (id: string) => getById("leave_requests", id);
export const createLeaveRequest = (data: Record<string, unknown>) => insert("leave_requests", data);
export const updateLeaveRequest = (id: string, data: Record<string, unknown>) => update("leave_requests", id, data);

// Attendance Records
export const getAttendanceRecords = (params?: Record<string, string>) => query("attendance_records", params);
export const createAttendanceRecord = (data: Record<string, unknown>) => insert("attendance_records", data);
export const updateAttendanceRecord = (id: string, data: Record<string, unknown>) => update("attendance_records", id, data);
