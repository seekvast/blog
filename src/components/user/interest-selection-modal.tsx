"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterestSelection } from "./interest-selection";

interface InterestSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function InterestSelectionModal({
  open,
  onOpenChange,
  onComplete,
}: InterestSelectionModalProps) {
  const handleComplete = () => {
    onOpenChange(false);
    if (onComplete) onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] w-[calc(100%-2rem)] rounded-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-0">
          <DialogTitle className="text-xl font-semibold">
            选择感兴趣内容
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <InterestSelection onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
