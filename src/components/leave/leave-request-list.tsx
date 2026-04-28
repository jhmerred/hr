"use client";

import { useState, useMemo } from "react";
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
import { Check, X, Ban, Search } from "lucide-react";
import Link from "next/link";
import {
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
  cancelLeaveRequestAction,
} from "@/app/actions";
import { LEAVE_STATUS_STYLES, getInitial } from "@/lib/constants";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function LeaveRequestList({
  requests,
  employees,
  leaveTypes,
  canApprove = true,
}: {
  requests: LeaveRequest[];
  employees: Employee[];
  leaveTypes: LeaveType[];
  canApprove?: boolean;
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; isApproved: boolean } | null>(null);
  const toast = useToast();

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const emp = empMap.get(r.employee_id);
      return (
        emp?.name.toLowerCase().includes(q) ||
        emp?.position?.toLowerCase().includes(q) ||
        ltMap.get(r.leave_type_id)?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    });
  }, [requests, search, empMap, ltMap]);

  const byStatus = (status?: string) =>
    status ? filtered.filter((r) => r.status === status) : filtered;

  const renderTable = (items: LeaveRequest[]) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
            <th className="text-left py-3 px-5">직원</th>
            <th className="text-left py-3 px-4">유형</th>
            <th className="text-left py-3 px-4">기간</th>
            <th className="text-left py-3 px-4">일수</th>
            <th className="text-left py-3 px-4">사유</th>
            <th className="text-left py-3 px-4">상태</th>
            <th className="text-right py-3 px-5 w-28">작업</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-sm text-gray-400 py-16">
                해당하는 휴가 신청이 없습니다
              </td>
            </tr>
          ) : (
            items.map((req) => {
              const emp = empMap.get(req.employee_id);
              const empName = emp?.name || "-";
              const status = LEAVE_STATUS_STYLES[req.status] || LEAVE_STATUS_STYLES.pending;
              return (
                <tr key={req.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {getInitial(empName)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{empName}</p>
                        <p className="text-xs text-gray-400">{emp?.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                      {ltMap.get(req.leave_type_id) || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/leave/${req.id}`} className="text-xs text-gray-700 hover:text-blue-600">
                      {req.start_date} ~ {req.end_date}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-800">{req.days}일</td>
                  <td className="py-3 px-4 text-xs text-gray-500 max-w-[180px] truncate">{req.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex justify-end gap-1">
                      {req.status === "pending" && canApprove && (
                        <>
                          <button
                            className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors"
                            title="승인"
                            onClick={() => setApproveTarget(req.id)}
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="반려"
                            onClick={() => setRejectId(req.id)}
                          >
                            <X className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </>
                      )}
                      {(req.status === "pending" || req.status === "approved") && (
                        <button
                          className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          title="취소"
                          onClick={() => setCancelTarget({ id: req.id, isApproved: req.status === "approved" })}
                        >
                          <Ban className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
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
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="직원, 유형, 사유 검색..."
          className="w-full max-w-sm pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none bg-white"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1 h-auto">
          {[
            { value: "pending", label: "대기", count: byStatus("pending").length },
            { value: "approved", label: "승인", count: byStatus("approved").length },
            { value: "rejected", label: "반려", count: byStatus("rejected").length },
            { value: "cancelled", label: "취소", count: byStatus("cancelled").length },
            { value: "all", label: "전체", count: filtered.length },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs font-medium rounded-md px-4 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
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
        <TabsContent value="cancelled" className="mt-4">
          {renderTable(byStatus("cancelled"))}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTable(filtered)}
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
                toast.success("휴가가 반려되었습니다");
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="reject_reason" className="text-sm">반려 사유</Label>
              <Textarea
                id="reject_reason"
                name="reject_reason"
                required
                placeholder="반려 사유를 입력해 주세요"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full rounded-lg">
              반려
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={async () => {
          if (approveTarget) {
            await approveLeaveRequestAction(approveTarget);
            toast.success("휴가가 승인되었습니다");
          }
        }}
        title="휴가 승인"
        description="이 휴가 신청을 승인하시겠습니까? 잔여 일수가 차감됩니다."
        confirmLabel="승인"
        variant="default"
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (cancelTarget) {
            await cancelLeaveRequestAction(cancelTarget.id);
            toast.success("휴가가 취소되었습니다");
          }
        }}
        title="휴가 취소"
        description={
          cancelTarget?.isApproved
            ? "승인된 휴가를 취소하면 잔여일수가 복구됩니다. 취소하시겠습니까?"
            : "이 휴가 신청을 취소하시겠습니까?"
        }
        confirmLabel="취소"
        variant="warning"
      />
    </>
  );
}
