"use client";

import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function NotificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <RouteProgress />
      <Header />
      <main className="mx-auto max-w-7xl overflow-hidden">{children}</main>
      <MobileNav />
    </div>
  );
}
