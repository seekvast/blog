"use client";

import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import { PostEditorProvider } from "@/components/providers/post-editor-provider";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { GlobalNsfwWarning } from "@/components/nsfw/global-nsfw-warning";

export default function UserLayout({
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
      {children}
      <PostEditorProvider />
      {/* 模态框组件 */}
      <LoginModal />
      <RegisterModal />
    </div>
  );
}
