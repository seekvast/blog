"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface NsfwWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NsfwWarningModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: NsfwWarningModalProps) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            兒少防護
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>即將訪問的內容，可能不適合某些年齡層閱讀，</p>
            <p>或不宜在工作時間瀏覽。</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                router.push("/");
              }}
            >
              離開
            </Button>
            <Button className="flex-1" onClick={onConfirm}>
              我知道了
            </Button>
          </div>

          <div className="pt-2">
            <button
              className="text-sm text-blue-600 hover:text-blue-700 underline"
              onClick={() => {
                window.open(
                  "https://support.kater.me/docs/policy/age-verification/",
                  "_blank"
                );
              }}
            >
              為什麼會出現此訊息？
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
