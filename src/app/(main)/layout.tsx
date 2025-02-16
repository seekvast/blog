"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import dynamic from "next/dynamic";
import { sidebarRegistry } from "@/components/layout/sidebar-components";
import { RightSidebar as RightSidebarComponent } from "@/components/layout/right-sidebar";

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
    <div className="min-h-screen">
      <RouteProgress />
      <Header />
      <div className="mx-auto max-w-7xl flex pt-8 pr-8 scroll-smooth">
        {LeftSidebarComponent && (
          <div className="sticky top-[88px] w-[300px] h-[calc(100vh-88px)]">
            <LeftSidebarComponent className="hidden lg:block" />
          </div>
        )}
        <div className="flex-1 flex px-4 min-w-0">
          <main className="flex-1 min-w-0 w-0">
            <div className="">{children}</div>
          </main>
          {showRightSidebar && (
            <aside className="ml-4 lg:w-40 xl:w-60 flex-shrink-0 pl-8">
              <RightSidebarComponent className="" />
            </aside>
          )}
        </div>
      </div>
      <Suspense fallback={null}>
        <CreatePostModal />
      </Suspense>
    </div>
  );
}
