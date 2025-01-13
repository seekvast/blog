import "./globals.css";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import "@/i18n"; 
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoginModalProvider } from "@/components/providers/login-modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata = {
  title: "Forum System",
  description: "A modern forum system built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <AuthProvider>
            <LoginModalProvider>
              {children}
            </LoginModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
