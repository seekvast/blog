import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { dir } from "i18next";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoginModalProvider } from "@/components/providers/login-modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { EmailVerificationProvider } from "@/components/providers/email-verification-provider";
import { InterestSelectionProvider } from "@/components/providers/interest-selection-provider";

import { cookies, headers } from "next/headers";
import { cookieName, fallbackLng, languages, defaultNS } from "@/i18n/settings";
import { initI18next } from "@/i18n/server";
import { I18nProvider } from "@/components/i18n-provider";

export const metadata = {
  cache: "no-cache", //TODO: 测试环境禁用缓存
  title: "Kater",
  description: "Kater",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

function getLanguageOnServer(): string {
  const headersList = headers();
  const localeHeader = headersList.get("k-locale");

  if (localeHeader && languages.includes(localeHeader)) {
    return localeHeader;
  }

  const cookieStore = cookies();
  const lng = cookieStore.get(cookieName)?.value;
  if (lng && languages.includes(lng)) {
    return lng;
  }

  return fallbackLng;
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const lng = getLanguageOnServer();
  const i18n = await initI18next(lng, defaultNS);
  const resources = i18n.store.data;

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider session={session}>
              <LoginModalProvider>
                <I18nProvider
                  lng={lng}
                  ns={Array.isArray(defaultNS) ? defaultNS : [defaultNS]}
                  resources={resources}
                >
                  <EmailVerificationProvider>
                    <InterestSelectionProvider>
                      {children}
                    </InterestSelectionProvider>
                  </EmailVerificationProvider>
                </I18nProvider>
                <Toaster />
              </LoginModalProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
