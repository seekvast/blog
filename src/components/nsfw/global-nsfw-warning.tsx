"use client";

import { useNsfwWarning } from "@/hooks/use-nsfw-warning";
import { NsfwWarningModal } from "@/components/nsfw/nsfw-warning-modal";

export function GlobalNsfwWarning() {
  const {
    showWarning: showNsfwWarning,
    handleConfirm: handleNsfwConfirm,
    handleCancel: handleNsfwCancel,
  } = useNsfwWarning();

  return (
    <NsfwWarningModal
      open={showNsfwWarning}
      onOpenChange={() => {}}
      onConfirm={handleNsfwConfirm}
      onCancel={handleNsfwCancel}
    />
  );
}
