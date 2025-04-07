"use client";

import { EmailVerificationBanner } from "@/components/email-verification-banner";

interface EmailVerificationProviderProps {
  children: React.ReactNode;
}

export function EmailVerificationProvider({ children }: EmailVerificationProviderProps) {
  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}
