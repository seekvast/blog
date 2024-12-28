"use client"

import { useTranslation } from "react-i18next"
import { Header } from "@/components/layout/header"

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  )
}
