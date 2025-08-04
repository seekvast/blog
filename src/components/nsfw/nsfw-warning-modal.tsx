"use client";

import React from "react";
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

  const handleLeave = () => {
    onOpenChange(false);
    router.push("/");
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-6 p-8">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-foreground">兒少防護</h1>

        {/* 内容 */}
        <div className="space-y-2 text-muted-foreground">
          <p>即將訪問的內容，可能不適合某些年齡層閱讀，</p>
          <p>或不宜在工作時間瀏覽。</p>
        </div>

        {/* 按钮 */}
        <div className="flex space-x-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleLeave}>
            離開
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            我知道了
          </Button>
        </div>

        {/* 帮助链接 */}
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
    </div>
  );
}
