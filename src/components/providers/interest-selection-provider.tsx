"use client";

import React, { createContext, useContext, useState } from "react";
import { InterestSelectionListener } from "@/components/user/interest-selection-listener";

interface InterestSelectionContextType {
  openInterestSelection: () => void;
  closeInterestSelection: () => void;
  isInterestSelectionOpen: boolean;
}

const InterestSelectionContext = createContext<InterestSelectionContextType | undefined>(undefined);

export function useInterestSelection() {
  const context = useContext(InterestSelectionContext);
  if (!context) {
    throw new Error("useInterestSelection must be used within InterestSelectionProvider");
  }
  return context;
}

export function InterestSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openInterestSelection = () => setIsOpen(true);
  const closeInterestSelection = () => setIsOpen(false);

  return (
    <InterestSelectionContext.Provider
      value={{
        openInterestSelection,
        closeInterestSelection,
        isInterestSelectionOpen: isOpen,
      }}
    >
      {children}
      <InterestSelectionListener 
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </InterestSelectionContext.Provider>
  );
}
