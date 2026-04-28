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
import { LEAVE_STATUS_STYLES, getInitial } from "@/lib/constants";

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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200">
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
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button
                          className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors"
                          onClick={async () => {
                            if (confirm("승인하시겠습니까?")) {
                              await approveLeaveRequestAction(req.id);
                            }
                          }}
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                          onClick={() => setRejectId(req.id)}
                        >
                          <X className="h-3.5 w-3.5 text-red-600" />
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
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1 h-auto">
          {[
            { value: "pending", label: "대기", count: byStatus("pending").length },
            { value: "approved", label: "승인", count: byStatus("approved").length },
            { value: "rejected", label: "반려", count: byStatus("rejected").length },
            { value: "all", label: "전체", count: requests.length },
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
    </>
  );
}
