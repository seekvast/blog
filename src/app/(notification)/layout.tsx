"use client";

import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlobalNsfwWarning } from "@/components/nsfw/global-nsfw-warning";

export default function NotificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <RouteProgress />

      {/* 全局 NSFW 警告弹窗 */}
      <GlobalNsfwWarning />

      <Header />
      <main className="mx-auto max-w-7xl overflow-hidden">{children}</main>
      <MobileNav />
    </div>
  );
}
