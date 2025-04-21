"use client";

import { InterestSelectionListener } from "@/components/user/interest-selection-listener";

export function InterestSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <InterestSelectionListener />
    </>
  );
}
