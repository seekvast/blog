"use client";

import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/header";

interface EditorLayoutProps {
  children: React.ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
