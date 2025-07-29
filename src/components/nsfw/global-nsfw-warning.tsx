"use client";

import { useNsfwWarning } from "@/hooks/use-nsfw-warning";
import { NsfwWarningModal } from "@/components/nsfw/nsfw-warning-modal";

export function GlobalNsfwWarning() {
  const {
    showWarning: showNsfwWarning,
    setShowWarning,
    handleConfirm: handleNsfwConfirm,
    handleCancel: handleNsfwCancel,
  } = useNsfwWarning();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowWarning(false);
    }
  };

  return (
    <NsfwWarningModal
      open={showNsfwWarning}
      onOpenChange={handleOpenChange}
      onConfirm={handleNsfwConfirm}
      onCancel={handleNsfwCancel}
    />
  );
}
