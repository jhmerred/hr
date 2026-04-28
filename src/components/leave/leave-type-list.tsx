"use client";

import { useState } from "react";
import { LeaveType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  X,
  Save,
  Hash,
} from "lucide-react";
import {
  createLeaveTypeAction,
  updateLeaveTypeAction,
  deleteLeaveTypeAction,
} from "@/app/actions";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300";

export function LeaveTypeList({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<LeaveType | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  return (
    <div>
      {/* 카드 리스트 */}
      <div className="space-y-2">
        {leaveTypes.map((lt) => (
          <div
            key={lt.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {lt.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        lt.is_active
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-gray-500 bg-gray-50 border-gray-200"
                      }`}
                    >
                      {lt.is_active ? "활성" : "비활성"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {lt.description || "설명 없음"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {lt.default_days}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">
                      일
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">기본 부여</p>
                </div>

                <div className="w-px h-8 bg-gray-100" />

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditItem(lt);
                      setOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    title="수정"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        confirm(`"${lt.name}" 휴가 유형을 삭제하시겠습니까?`)
                      ) {
                        setDeleting(lt.id);
                        await deleteLeaveTypeAction(lt.id);
                        setDeleting(null);
                      }
                    }}
                    disabled={deleting === lt.id}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="삭제"
                  >
                    {deleting === lt.id ? (
                      <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 추가 버튼 */}
        <button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
          className="w-full border-2 border-dashed border-gray-200 rounded-lg py-5 flex items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
        >
          <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600">
            새 휴가 유형 추가
          </span>
        </button>
      </div>

      {/* 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
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
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                유형명 <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={editItem?.name || ""}
                placeholder="예: 연차, 병가, 경조사"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                설명
              </label>
              <textarea
                name="description"
                defaultValue={editItem?.description || ""}
                placeholder="이 휴가 유형의 사용 조건이나 규정을 입력하세요"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                기본 부여 일수 <span className="text-red-400">*</span>
              </label>
              <input
                name="default_days"
                type="number"
                required
                min={1}
                defaultValue={editItem?.default_days || 15}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                잔여 휴가 초기화 시 이 일수가 기본값으로 적용됩니다
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editItem ? "변경사항 저장" : "유형 추가"}
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
