"use client";

import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { useParams } from "next/navigation";
import i18nClient from "@/i18n";

interface I18nProviderProps {
  children: ReactNode;
}

function LanguageUpdater() {
  const params = useParams<{ lng: string }>();

  useEffect(() => {
    if (params?.lng && i18nClient.language !== params.lng) {
      i18nClient.changeLanguage(params.lng);
    }
  }, [params?.lng]);

  return null;
}

export function I18nProvider({ children }: I18nProviderProps) {
  return (
    <I18nextProvider i18n={i18nClient}>
      <LanguageUpdater />
      {children}
    </I18nextProvider>
  );
}
