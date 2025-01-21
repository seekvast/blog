import "./globals.css";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import "@/i18n"; 
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoginModalProvider } from "@/components/providers/login-modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0"
        />
      </head>
      <body className={cn("min-h-screen bg-background antialiased", fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider session={session}>
            <LoginModalProvider>
              <I18nProvider>
                {children}
                <Toaster />
              </I18nProvider>
            </LoginModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
