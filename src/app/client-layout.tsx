"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import "@/i18n";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>
        {children}
      </Providers>
    </ThemeProvider>
  );
}
