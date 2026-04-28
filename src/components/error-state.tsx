"use client";

import { AlertCircle, RefreshCw, LogIn } from "lucide-react";
import Link from "next/link";

export function ErrorState({
  title = "데이터를 불러올 수 없습니다",
  description,
  isTokenError = false,
}: {
  title?: string;
  description?: string;
  isTokenError?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-6 max-w-sm leading-relaxed">
        {description ||
          (isTokenError
            ? "인증이 만료되었습니다. 다시 로그인해 주세요."
            : "서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.")}
      </p>
      {isTokenError ? (
        <Link
          href="/api/auth/login"
          className="flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />
          다시 로그인
        </Link>
      ) : (
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 border border-gray-200 text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </button>
      )}
    </div>
  );
}
