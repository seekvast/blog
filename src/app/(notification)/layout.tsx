"use client";

import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <RouteProgress />
      <Header />
      {children}
      <MobileNav />
    </div>
  );
}
