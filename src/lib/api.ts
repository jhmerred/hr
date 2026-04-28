const API_BASE = process.env.APPHUB_API_URL || "https://hub-api.jocodingax.ai";
const APP_SLUG = process.env.APPHUB_APP_SLUG || "hr";
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";

// OAuth 토큰 캐시
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  // 캐시된 토큰이 유효하면 재사용
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  // Client Credentials 방식으로 토큰 발급
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "read write",
      resource: `${API_BASE}/mcp`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[oauth] token error ${res.status}: ${text.substring(0, 200)}`);
    throw new Error(`OAuth token error ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return cachedToken.token;
}

let reqId = 0;

// MCP JSON-RPC 호출 (OAuth Bearer 인증)
async function mcpCall(toolName: string, args: Record<string, unknown>) {
  const token = await getOAuthToken();
  reqId++;

  const res = await fetch(`${API_BASE}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
    console.error(`[mcp] error: ${json.error.message}`);
    throw new Error(json.error.message);
  }

  const text = json.result?.content?.[0]?.text;
  if (text) return JSON.parse(text);
  return json.result;
}

// Records CRUD
async function query(table: string, filters?: Record<string, unknown>) {
  const args: Record<string, unknown> = { table_name: table, action: "query", per: 100 };
  if (filters) args.filters = filters;
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

export const getDepartments = () => query("departments");
export const getDepartment = (id: string) => getById("departments", id);
export const createDepartment = (data: Record<string, unknown>) => insert("departments", data);
export const updateDepartment = (id: string, data: Record<string, unknown>) => update("departments", id, data);
export const deleteDepartment = (id: string) => remove("departments", id);

export const getEmployees = (params?: Record<string, string>) => query("employees", params);
export const getEmployee = (id: string) => getById("employees", id);
export const createEmployee = (data: Record<string, unknown>) => insert("employees", data);
export const updateEmployee = (id: string, data: Record<string, unknown>) => update("employees", id, data);
export const deleteEmployee = (id: string) => remove("employees", id);

export const getLeaveTypes = () => query("leave_types");
export const createLeaveType = (data: Record<string, unknown>) => insert("leave_types", data);
export const updateLeaveType = (id: string, data: Record<string, unknown>) => update("leave_types", id, data);
export const deleteLeaveType = (id: string) => remove("leave_types", id);

export const getLeaveBalances = (params?: Record<string, string>) => query("leave_balances", params);
export const createLeaveBalance = (data: Record<string, unknown>) => insert("leave_balances", data);
export const updateLeaveBalance = (id: string, data: Record<string, unknown>) => update("leave_balances", id, data);

export const getLeaveRequests = (params?: Record<string, string>) => query("leave_requests", params);
export const getLeaveRequest = (id: string) => getById("leave_requests", id);
export const createLeaveRequest = (data: Record<string, unknown>) => insert("leave_requests", data);
export const updateLeaveRequest = (id: string, data: Record<string, unknown>) => update("leave_requests", id, data);

export const getAttendanceRecords = (params?: Record<string, string>) => query("attendance_records", params);
export const createAttendanceRecord = (data: Record<string, unknown>) => insert("attendance_records", data);
export const updateAttendanceRecord = (id: string, data: Record<string, unknown>) => update("attendance_records", id, data);
