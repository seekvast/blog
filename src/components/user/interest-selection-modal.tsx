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
      <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-lg p-6">
        <InterestSelection onComplete={handleComplete} />
      </DialogContent>
    </Dialog>
  );
}
