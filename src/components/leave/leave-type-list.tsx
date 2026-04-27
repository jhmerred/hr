"use client";

import { useState } from "react";
import { LeaveType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createLeaveTypeAction,
  updateLeaveTypeAction,
  deleteLeaveTypeAction,
} from "@/app/actions";

export function LeaveTypeList({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<LeaveType | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditItem(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          휴가 유형 추가
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editItem ? "휴가 유형 수정" : "새 휴가 유형 추가"}
              </DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                if (editItem) {
                  await updateLeaveTypeAction(editItem.id, formData);
                } else {
                  await createLeaveTypeAction(formData);
                }
                setOpen(false);
                setEditItem(null);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">유형명</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editItem?.name || ""}
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editItem?.description || ""}
                />
              </div>
              <div>
                <Label htmlFor="default_days">기본 부여 일수</Label>
                <Input
                  id="default_days"
                  name="default_days"
                  type="number"
                  required
                  min={1}
                  defaultValue={editItem?.default_days || 15}
                />
              </div>
              <Button type="submit" className="w-full">
                {editItem ? "수정" : "추가"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>유형명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>기본 일수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-24">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  등록된 휴가 유형이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              leaveTypes.map((lt) => (
                <TableRow key={lt.id}>
                  <TableCell className="font-medium">{lt.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lt.description}
                  </TableCell>
                  <TableCell>{lt.default_days}일</TableCell>
                  <TableCell>
                    <Badge variant={lt.is_active ? "default" : "secondary"}>
                      {lt.is_active ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditItem(lt);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm("정말 삭제하시겠습니까?")) {
                            await deleteLeaveTypeAction(lt.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
