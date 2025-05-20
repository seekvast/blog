"use client";

import { useEffect } from "react";
import { useRegistrationStore } from "@/store/registration-store";
import { InterestSelectionModal } from "./interest-selection-modal";
import { useAuth } from "@/components/providers/auth-provider";

interface InterestSelectionListenerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterestSelectionListener({
  open,
  onOpenChange,
}: InterestSelectionListenerProps) {
  const { isNewlyRegistered, setNewlyRegistered } = useRegistrationStore();
  const { user } = useAuth();

  useEffect(() => {
    if (isNewlyRegistered && user) {
      onOpenChange(true);
      setNewlyRegistered(false);
    }
  }, [isNewlyRegistered, user, setNewlyRegistered, onOpenChange]);

  const handleComplete = () => {};

  return (
    <InterestSelectionModal
      open={open}
      onOpenChange={onOpenChange}
      onComplete={handleComplete}
    />
  );
}
