"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  loading?: boolean;
  showIcon?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  variant = "default",
  loading = false,
  showIcon = true,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader className="border-b border-destructive/10 pb-4">
          <DialogTitle className="text-destructive flex items-center gap-2 text-lg font-semibold">
            {showIcon && <AlertTriangle className="h-5 w-5 text-destructive" />}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="flex flex-col gap-2">
            <p className="text-base text-foreground">{description}</p>
            {variant === "destructive" && (
              <p className="text-sm font-medium text-destructive">
                此操作无法撤销
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
          >
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "处理中..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
