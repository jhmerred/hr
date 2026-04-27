"use client";

import { useState } from "react";
import { Department } from "@/lib/types";
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
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/app/actions";

export function DepartmentList({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditDept(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          부서 추가
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editDept ? "부서 수정" : "새 부서 추가"}
              </DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                if (editDept) {
                  await updateDepartmentAction(editDept.id, formData);
                } else {
                  await createDepartmentAction(formData);
                }
                setOpen(false);
                setEditDept(null);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">부서명</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editDept?.name || ""}
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editDept?.description || ""}
                />
              </div>
              <Button type="submit" className="w-full">
                {editDept ? "수정" : "추가"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>부서명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-24">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  등록된 부서가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {dept.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditDept(dept);
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
                            await deleteDepartmentAction(dept.id);
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
