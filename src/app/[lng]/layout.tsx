import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProviderFixed } from "@/components/i18n-provider-fixed";
import { QueryProvider } from "@/components/providers/query-provider";
import { dir } from "i18next";
import { languages } from "@/i18n/settings";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoginModalProvider } from "@/components/providers/login-modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { EmailVerificationProvider } from "@/components/providers/email-verification-provider";
import { InterestSelectionProvider } from "@/components/providers/interest-selection-provider";

export const metadata = { title: "Kater", description: "Kater" };

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function RootLayout({
  children,
  params: { lng },
}: {
  children: ReactNode;
  params: { lng: string };
}) {
  const session = await getServerSession(authOptions);

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
                <I18nProviderFixed lng={lng}>
                  <EmailVerificationProvider>
                    <InterestSelectionProvider>
                      {children}
                    </InterestSelectionProvider>
                  </EmailVerificationProvider>
                </I18nProviderFixed>
                <Toaster />
              </LoginModalProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
