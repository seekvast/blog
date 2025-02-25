"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import dynamic from "next/dynamic";
import { sidebarRegistry } from "@/components/layout/sidebar-components";
import { RightSidebar as RightSidebarComponent } from "@/components/layout/right-sidebar";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";

const CreatePostModal = dynamic(
  () => import("@/components/post/create-post-modal"),
  { ssr: false }
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 根据路径确定使用哪个侧边栏配置
  const getSidebarConfig = () => {
    // 使用正则表达式精确匹配板块设置页路径
    if (pathname?.match(/^\/b\/[^/]+\/settings/)) {
      return sidebarRegistry.boardSettings;
    }
    if (pathname?.startsWith("/u")) {
      return sidebarRegistry.user;
    }
    if (pathname?.startsWith("/b")) {
      return sidebarRegistry.boards;
    }
    return sidebarRegistry.default;
  };

  const { left: LeftSidebarComponent, right: RightSidebar } =
    getSidebarConfig();

  // 确定是否显示右侧边栏
  const showDefaultSidebarPaths = ["/", "/search"];
  const showRightSidebar = pathname
    ? showDefaultSidebarPaths.includes(pathname)
    : false;

  return (
    <div className="min-h-screen flex flex-col">
      <RouteProgress />

      {/* 头部 */}
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="mx-auto w-full max-w-7xl flex flex-col lg:flex-row md:pt-4">
          {/* 左侧边栏 - 桌面端显示 */}
          {LeftSidebarComponent && (
            <aside className="hidden lg:block lg:w-[300px] flex-shrink-0 lg:pr-8">
              <LeftSidebarComponent />
            </aside>
          )}

          {/* 主内容区域 */}
          <div className="flex-1 flex flex-col min-w-0 px-4 pb-16 lg:pb-8">
            <main className="flex-1 min-w-0 w-full">{children}</main>

            {/* 右侧边栏 - 仅在桌面端显示 */}
            {showRightSidebar && (
              <aside className="hidden lg:block lg:w-[240px] xl:w-[300px] flex-shrink-0 lg:pl-8">
                <RightSidebar />
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <MobileNav />
      {/* 模态框 */}
      <LoginModal />
      <RegisterModal />
      <Suspense fallback={null}>
        <CreatePostModal />
      </Suspense>
    </div>
  );
}
