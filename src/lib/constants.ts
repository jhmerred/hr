// Status badge styles - minimal color usage
// green = normal/active, red = danger/rejected, amber = warning/pending, gray = inactive/cancelled

export const EMPLOYEE_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active: { label: "재직", cls: "text-green-700 bg-green-50 border-green-200" },
  inactive: { label: "퇴직", cls: "text-gray-500 bg-gray-50 border-gray-200" },
  on_leave: { label: "휴직", cls: "text-amber-700 bg-amber-50 border-amber-200" },
};

export const LEAVE_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending: { label: "대기", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  approved: { label: "승인", cls: "text-green-700 bg-green-50 border-green-200" },
  rejected: { label: "반려", cls: "text-red-700 bg-red-50 border-red-200" },
  cancelled: { label: "취소", cls: "text-gray-500 bg-gray-50 border-gray-200" },
};

export const ATTENDANCE_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  normal: { label: "정상", cls: "text-green-700 bg-green-50 border-green-200" },
  late: { label: "지각", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  early_leave: { label: "조퇴", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  overtime: { label: "초과근무", cls: "text-red-700 bg-red-50 border-red-200" },
  leave: { label: "휴가", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  absent: { label: "결근", cls: "text-gray-600 bg-gray-100 border-gray-200" },
};

// Avatar: uniform gray for all users
export function getInitial(name: string): string {
  return name.charAt(0);
}
