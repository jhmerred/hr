"use client";

import { useState } from "react";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import Link from "next/link";
import {
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
} from "@/app/actions";

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: "대기", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  approved: { label: "승인", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  rejected: { label: "반려", cls: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled: { label: "취소", cls: "text-gray-500 bg-gray-50 border-gray-200" },
};

const avatarColors = [
  "avatar-blue", "avatar-purple", "avatar-green", "avatar-amber", "avatar-rose", "avatar-cyan",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function LeaveRequestList({
  requests,
  employees,
  leaveTypes,
}: {
  requests: LeaveRequest[];
  employees: Employee[];
  leaveTypes: LeaveType[];
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const byStatus = (status?: string) =>
    status ? requests.filter((r) => r.status === status) : requests;

  const renderTable = (items: LeaveRequest[]) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left py-3 px-5">직원</th>
            <th className="text-left py-3 px-4">유형</th>
            <th className="text-left py-3 px-4">기간</th>
            <th className="text-left py-3 px-4">일수</th>
            <th className="text-left py-3 px-4">사유</th>
            <th className="text-left py-3 px-4">상태</th>
            <th className="text-right py-3 px-5 w-20">작업</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-[13px] text-gray-400 py-16">
                해당하는 휴가 신청이 없습니다
              </td>
            </tr>
          ) : (
            items.map((req) => {
              const emp = empMap.get(req.employee_id);
              const empName = emp?.name || "-";
              const status = statusConfig[req.status] || statusConfig.pending;
              return (
                <tr key={req.id} className="border-b border-gray-50 last:border-0 table-row-hover group">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${getAvatarColor(empName)}`}>
                        {empName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-gray-800">{empName}</p>
                        <p className="text-[10px] text-gray-400">{emp?.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-[2px] rounded-md">
                      {ltMap.get(req.leave_type_id) || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/leave/${req.id}`} className="text-[12px] text-gray-700 hover:text-blue-600">
                      {req.start_date} ~ {req.end_date}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-[12px] font-semibold text-gray-800">{req.days}일</td>
                  <td className="py-3 px-4 text-[11px] text-gray-500 max-w-[180px] truncate">{req.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-[3px] rounded-md border font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button
                          className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          onClick={async () => {
                            if (confirm("승인하시겠습니까?")) {
                              await approveLeaveRequestAction(req.id);
                            }
                          }}
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors"
                          onClick={() => setRejectId(req.id)}
                        >
                          <X className="h-3.5 w-3.5 text-rose-600" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Tabs defaultValue="pending">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 h-auto">
          {[
            { value: "pending", label: "대기", count: byStatus("pending").length },
            { value: "approved", label: "승인", count: byStatus("approved").length },
            { value: "rejected", label: "반려", count: byStatus("rejected").length },
            { value: "all", label: "전체", count: requests.length },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[12px] font-medium rounded-lg px-4 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">{tab.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {renderTable(byStatus("pending"))}
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          {renderTable(byStatus("approved"))}
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          {renderTable(byStatus("rejected"))}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTable(requests)}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>휴가 반려</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              if (rejectId) {
                await rejectLeaveRequestAction(rejectId, formData);
                setRejectId(null);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="reject_reason" className="text-[13px]">반려 사유</Label>
              <Textarea
                id="reject_reason"
                name="reject_reason"
                required
                placeholder="반려 사유를 입력해 주세요"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full rounded-xl">
              반려
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
