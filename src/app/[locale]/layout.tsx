import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { i18n } from "@/i18n/config"
import { Providers } from "@/components/providers"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kater",
  description: "A modern forum system",
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  // 验证语言设置
  if (!i18n.locales.includes(locale)) {
    const headersList = headers()
    locale = headersList.get("accept-language")?.split(",")?.[0] || i18n.defaultLocale
    if (!i18n.locales.includes(locale)) {
      locale = i18n.defaultLocale
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
