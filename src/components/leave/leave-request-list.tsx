"use client";

import { useState } from "react";
import { LeaveRequest, Employee, LeaveType } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import Link from "next/link";
import {
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
} from "@/app/actions";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "대기", variant: "outline" },
  approved: { label: "승인", variant: "default" },
  rejected: { label: "반려", variant: "destructive" },
  cancelled: { label: "취소", variant: "secondary" },
};

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

  const empMap = new Map(employees.map((e) => [e.id, e.name]));
  const ltMap = new Map(leaveTypes.map((lt) => [lt.id, lt.name]));

  const byStatus = (status?: string) =>
    status ? requests.filter((r) => r.status === status) : requests;

  const renderTable = (items: LeaveRequest[]) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>직원</TableHead>
            <TableHead>휴가 유형</TableHead>
            <TableHead>기간</TableHead>
            <TableHead>일수</TableHead>
            <TableHead>사유</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-24">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                해당하는 휴가 신청이 없습니다
              </TableCell>
            </TableRow>
          ) : (
            items.map((req) => {
              const status = statusConfig[req.status] || statusConfig.pending;
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {empMap.get(req.employee_id) || "-"}
                  </TableCell>
                  <TableCell>{ltMap.get(req.leave_type_id) || "-"}</TableCell>
                  <TableCell>
                    <Link
                      href={`/leave/${req.id}`}
                      className="text-primary hover:underline"
                    >
                      {req.start_date} ~ {req.end_date}
                    </Link>
                  </TableCell>
                  <TableCell>{req.days}일</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {req.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            if (confirm("승인하시겠습니까?")) {
                              await approveLeaveRequestAction(req.id);
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setRejectId(req.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            대기 ({byStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            승인 ({byStatus("approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            반려 ({byStatus("rejected").length})
          </TabsTrigger>
          <TabsTrigger value="all">전체 ({requests.length})</TabsTrigger>
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
              <Label htmlFor="reject_reason">반려 사��</Label>
              <Textarea
                id="reject_reason"
                name="reject_reason"
                required
                placeholder="반려 사유를 입력해 주세요"
              />
            </div>
            <Button type="submit" variant="destructive" className="w-full">
              반려
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
