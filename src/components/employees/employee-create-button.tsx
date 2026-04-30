"use client";

import { useState } from "react";
import { Department } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, User, Mail, Phone, Briefcase, Calendar, Building2, Save, X } from "lucide-react";
import { createEmployeeAction } from "@/app/actions";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all placeholder:text-gray-300";

const selectCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all appearance-none";

export function EmployeeCreateButton({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
        직원 등록
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              새 직원 등록
            </DialogTitle>
          </DialogHeader>

          <form
            action={async (formData) => {
              setSubmitting(true);
              try {
                await createEmployeeAction(formData);
                toast.success("새 직원이 등록되었습니다");
                setOpen(false);
              } catch {
                toast.error("등록 중 오류가 발생했습니다");
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-5 pt-3"
          >
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <User className="h-3 w-3 text-gray-400" />
                  이름 <span className="text-red-400">*</span>
                </label>
                <input name="name" required placeholder="홍길동" className={inputCls} />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <Mail className="h-3 w-3 text-gray-400" />
                  이메일 <span className="text-red-400">*</span>
                </label>
                <input name="email" type="email" required placeholder="hong@example.com" className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">로그인 SSO 이메일과 동일해야 합니다</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <Phone className="h-3 w-3 text-gray-400" />
                  전화번호
                </label>
                <input name="phone" placeholder="010-1234-5678" className={inputCls} />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <Briefcase className="h-3 w-3 text-gray-400" />
                  직책 <span className="text-red-400">*</span>
                </label>
                <input name="position" required placeholder="사원, 대리, 과장..." className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  입사일 <span className="text-red-400">*</span>
                </label>
                <input name="hire_date" type="date" required className={inputCls} />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  부서 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select name="department_id" required className={selectCls}>
                    <option value="">선택</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    등록
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 h-11 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
