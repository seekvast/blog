import { ClientLayout } from "./client-layout";
import "./globals.css";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0"
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
