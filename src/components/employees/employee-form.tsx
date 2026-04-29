"use client";

import { useState } from "react";
import { Department, Employee } from "@/lib/types";
import { createEmployeeAction, updateEmployeeAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building2,
  Shield,
  Save,
  ArrowLeft,
} from "lucide-react";
import { EMPLOYEE_STATUS_STYLES } from "@/lib/constants";

function FormField({
  icon: Icon,
  label,
  required,
  children,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-xs text-gray-400 mt-1.5">{description}</p>
      )}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all placeholder:text-gray-300";

const selectCls =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all appearance-none";

export function EmployeeForm({
  departments,
  employee,
}: {
  departments: Department[];
  employee?: Employee;
}) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!employee;

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          if (employee) {
            await updateEmployeeAction(employee.id, formData);
            toast.success("직원 정보가 수정되었습니다");
          } else {
            await createEmployeeAction(formData);
            toast.success("새 직원이 등록되었습니다");
          }
          router.push("/employees");
        } catch {
          toast.error("처리 중 오류가 발생했습니다");
          setSubmitting(false);
        }
      }}
    >
      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">기본 정보</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            직원의 기본 인적사항을 입력합니다
          </p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField icon={User} label="이름" required>
              <input
                name="name"
                required
                defaultValue={employee?.name || ""}
                placeholder="홍길동"
                className={inputCls}
              />
            </FormField>
            <FormField
              icon={Mail}
              label="이메일"
              required
              description="사내 이메일을 입력해 주세요"
            >
              <input
                name="email"
                type="email"
                required
                defaultValue={employee?.email || ""}
                placeholder="gildong.hong@company.com"
                className={inputCls}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField icon={Phone} label="전화번호">
              <input
                name="phone"
                defaultValue={employee?.phone || ""}
                placeholder="010-1234-5678"
                className={inputCls}
              />
            </FormField>
            <FormField icon={Briefcase} label="직책" required>
              <input
                name="position"
                required
                defaultValue={employee?.position || ""}
                placeholder="사원, 대리, 과장, 부장..."
                className={inputCls}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* 근무 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-5">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">근무 정보</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            소속 부서와 입사일을 설정합니다
          </p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              icon={Calendar}
              label="입사일"
              required
              description="연차 자동 계산에 사용됩니다"
            >
              <input
                name="hire_date"
                type="date"
                required
                defaultValue={employee?.hire_date || ""}
                className={inputCls}
              />
            </FormField>
            <FormField icon={Building2} label="부서" required>
              <div className="relative">
                <select
                  name="department_id"
                  required
                  defaultValue={employee?.department_id || ""}
                  className={selectCls}
                >
                  <option value="">부서를 선택하세요</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </FormField>
          </div>

          {isEdit && (
            <FormField icon={Shield} label="재직 상태">
              <div className="flex gap-2">
                {(
                  Object.entries(EMPLOYEE_STATUS_STYLES) as [
                    string,
                    { label: string; cls: string },
                  ][]
                ).map(([value, style]) => (
                  <label key={value} className="flex-1">
                    <input
                      type="radio"
                      name="status"
                      value={value}
                      defaultChecked={employee.status === value}
                      className="peer sr-only"
                    />
                    <div
                      className={`text-center px-3 py-3 rounded-lg border cursor-pointer transition-all peer-checked:ring-2 peer-checked:ring-gray-900 peer-checked:border-gray-900 hover:border-gray-300 ${
                        employee.status === value
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${style.cls}`}
                      >
                        {style.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </FormField>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-12 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? "변경사항 저장" : "직원 등록"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 h-12 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          취소
        </button>
      </div>
    </form>
  );
}
