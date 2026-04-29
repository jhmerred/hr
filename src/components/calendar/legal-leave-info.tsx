"use client";

import { useState } from "react";
import { Scale, ChevronDown, ChevronUp } from "lucide-react";
import { LEGAL_LEAVE_POLICIES } from "@/lib/holidays";

export function LegalLeaveInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Scale className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-900">한국 법정 휴가 제도</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              근로기준법 및 관련 법률에 따른 휴가 기준 ({LEGAL_LEAVE_POLICIES.length}개 항목)
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEGAL_LEAVE_POLICIES.map((policy, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800">{policy.name}</h3>
                  <div className="flex gap-1.5">
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {policy.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        policy.paid
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {policy.paid ? "유급" : "무급"}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1.5">{policy.days}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
