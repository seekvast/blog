"use client";

import { useEffect, useState } from "react";
import { useRegistrationStore } from "@/store/registration-store";
import { InterestSelectionModal } from "./interest-selection-modal";
import { useSession } from "next-auth/react";

export function InterestSelectionListener() {
  const [isOpen, setIsOpen] = useState(false);
  const { isNewlyRegistered, setNewlyRegistered } = useRegistrationStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (isNewlyRegistered && session?.user) {
      setIsOpen(true);
      setNewlyRegistered(false);
    }
  }, [isNewlyRegistered, session, setNewlyRegistered]);

  const handleComplete = () => {};

  return (
    <InterestSelectionModal
      open={isOpen}
      onOpenChange={setIsOpen}
      onComplete={handleComplete}
    />
  );
}
