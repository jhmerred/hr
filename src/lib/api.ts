// apphub 자동 주입: APPHUB_API_URL, APPHUB_API_KEY, APPHUB_APP_SLUG
const MCP_URL = (process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai") + "/mcp";
const API_KEY = process.env.APPHUB_API_KEY || process.env.APP_KEY || "";
const APP_SLUG = process.env.APPHUB_APP_SLUG || "hr";

let requestId = 0;

async function mcpCall(method: string, params: Record<string, unknown>) {
  requestId++;
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "X-Api-Key": API_KEY,
      "X-App-Key": API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: requestId,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`MCP error ${res.status}: ${text}`);
    throw new Error(`MCP error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.error) {
    console.error(`MCP RPC error: ${JSON.stringify(json.error)}`);
    throw new Error(`MCP error: ${json.error.message}`);
  }

  return json.result;
}

// MCP tools/call wrapper
async function callTool(tool: string, args: Record<string, unknown>) {
  const result = await mcpCall("tools/call", {
    name: tool,
    arguments: { app_slug: APP_SLUG, ...args },
  });

  // MCP tool result is { content: [{ type: "text", text: "..." }] }
  if (result?.content?.[0]?.text) {
    return JSON.parse(result.content[0].text);
  }
  return result;
}

// Records API via MCP
async function queryRecords(
  tableName: string,
  filters?: Record<string, unknown>,
  sort?: string,
  page?: number,
  per?: number
) {
  const args: Record<string, unknown> = {
    table_name: tableName,
    action: "query",
  };
  if (filters) args.filters = filters;
  if (sort) args.sort = sort;
  if (page) args.page = page;
  if (per) args.per = per;

  return callTool("records", args);
}

async function getRecord(tableName: string, id: string) {
  return callTool("records", {
    table_name: tableName,
    action: "query",
    id,
  });
}

async function insertRecord(tableName: string, data: Record<string, unknown>) {
  return callTool("records", {
    table_name: tableName,
    action: "insert",
    data,
  });
}

async function updateRecord(
  tableName: string,
  id: string,
  data: Record<string, unknown>
) {
  return callTool("records", {
    table_name: tableName,
    action: "update",
    id,
    data,
  });
}

async function deleteRecord(tableName: string, id: string) {
  return callTool("records", {
    table_name: tableName,
    action: "delete",
    id,
  });
}

// === Public API ===

// Departments
export const getDepartments = () => queryRecords("departments");
export const getDepartment = (id: string) => getRecord("departments", id);
export const createDepartment = (data: Record<string, unknown>) =>
  insertRecord("departments", data);
export const updateDepartment = (id: string, data: Record<string, unknown>) =>
  updateRecord("departments", id, data);
export const deleteDepartment = (id: string) =>
  deleteRecord("departments", id);

// Employees
export const getEmployees = (params?: Record<string, string>) =>
  queryRecords("employees", params ? params : undefined);
export const getEmployee = (id: string) => getRecord("employees", id);
export const createEmployee = (data: Record<string, unknown>) =>
  insertRecord("employees", data);
export const updateEmployee = (id: string, data: Record<string, unknown>) =>
  updateRecord("employees", id, data);
export const deleteEmployee = (id: string) => deleteRecord("employees", id);

// Leave Types
export const getLeaveTypes = () => queryRecords("leave_types");
export const createLeaveType = (data: Record<string, unknown>) =>
  insertRecord("leave_types", data);
export const updateLeaveType = (id: string, data: Record<string, unknown>) =>
  updateRecord("leave_types", id, data);
export const deleteLeaveType = (id: string) =>
  deleteRecord("leave_types", id);

// Leave Balances
export const getLeaveBalances = (params?: Record<string, string>) =>
  queryRecords("leave_balances", params ? params : undefined);
export const createLeaveBalance = (data: Record<string, unknown>) =>
  insertRecord("leave_balances", data);
export const updateLeaveBalance = (id: string, data: Record<string, unknown>) =>
  updateRecord("leave_balances", id, data);

// Leave Requests
export const getLeaveRequests = (params?: Record<string, string>) =>
  queryRecords("leave_requests", params ? params : undefined);
export const getLeaveRequest = (id: string) =>
  getRecord("leave_requests", id);
export const createLeaveRequest = (data: Record<string, unknown>) =>
  insertRecord("leave_requests", data);
export const updateLeaveRequest = (id: string, data: Record<string, unknown>) =>
  updateRecord("leave_requests", id, data);

// Attendance Records
export const getAttendanceRecords = (params?: Record<string, string>) =>
  queryRecords("attendance_records", params ? params : undefined);
export const createAttendanceRecord = (data: Record<string, unknown>) =>
  insertRecord("attendance_records", data);
export const updateAttendanceRecord = (
  id: string,
  data: Record<string, unknown>
) => updateRecord("attendance_records", id, data);
