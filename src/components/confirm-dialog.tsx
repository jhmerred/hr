"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "확인",
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}) {
  const btnCls =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : variant === "warning"
      ? "bg-amber-600 hover:bg-amber-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                variant === "danger"
                  ? "bg-red-50"
                  : variant === "warning"
                  ? "bg-amber-50"
                  : "bg-blue-50"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  variant === "danger"
                    ? "text-red-500"
                    : variant === "warning"
                    ? "text-amber-500"
                    : "text-blue-500"
                }`}
              />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 ml-10">{description}</p>
        <div className="flex gap-3 mt-2 ml-10">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${btnCls}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
