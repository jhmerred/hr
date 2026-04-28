"use client";

import { useState } from "react";
import { Department } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/app/actions";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all placeholder:text-gray-300";

export function DepartmentList({
  departments,
  deptCounts,
}: {
  departments: Department[];
  deptCounts: Map<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const toast = useToast();

  // no color array - uniform gray

  return (
    <div>
      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, i) => {
          const count = deptCounts.get(dept.id) || 0;
          return (
            <div
              key={dept.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
                    >
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dept.description || "설명 없음"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-medium ${
                      dept.is_active
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-gray-500 bg-gray-50 border-gray-200"
                    }`}
                  >
                    {dept.is_active ? "활성" : "비활성"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-semibold">{count}</span>명
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditDept(dept);
                      setOpen(true);
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    title="수정"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(dept)}
                    disabled={deleting === dept.id}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="삭제"
                  >
                    {deleting === dept.id ? (
                      <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* 추가 카드 */}
        <button
          onClick={() => {
            setEditDept(null);
            setOpen(true);
          }}
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all group min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-700" />
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-700">
            새 부서 추가
          </span>
        </button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            setDeleting(deleteTarget.id);
            await deleteDepartmentAction(deleteTarget.id);
            setDeleting(null);
            toast.success("부서가 삭제되었습니다");
          }
        }}
        title="부서 삭제"
        description={`"${deleteTarget?.name}" 부서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="danger"
      />

      {/* 추가/수정 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              {editDept ? "부서 수정" : "새 부서 추가"}
            </DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              if (editDept) {
                await updateDepartmentAction(editDept.id, formData);
                toast.success("부서가 수정되었습니다");
              } else {
                await createDepartmentAction(formData);
                toast.success("새 부서가 추가되었습니다");
              }
              setOpen(false);
              setEditDept(null);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                부서명 <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={editDept?.name || ""}
                placeholder="예: 개발팀"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                설명
              </label>
              <textarea
                name="description"
                defaultValue={editDept?.description || ""}
                placeholder="부서의 역할과 담당 업무를 입력하세요"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 h-11 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editDept ? "변경사항 저장" : "부서 추가"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 h-11 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                취소
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
