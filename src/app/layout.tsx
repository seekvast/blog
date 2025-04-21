import "./globals.css";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import "@/i18n";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoginModalProvider } from "@/components/providers/login-modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { EmailVerificationProvider } from "@/components/providers/email-verification-provider";
import { InterestSelectionProvider } from "@/components/providers/interest-selection-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  cache: "no-cache", //TODO: 测试环境禁用缓存
  title: "Forum System",
  description: "A modern forum system built with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.variable
        )}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider session={session}>
              <LoginModalProvider>
                <I18nProvider>
                  <EmailVerificationProvider>
                    <InterestSelectionProvider>
                      {children}
                    </InterestSelectionProvider>
                    <Toaster />
                  </EmailVerificationProvider>
                </I18nProvider>
              </LoginModalProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
