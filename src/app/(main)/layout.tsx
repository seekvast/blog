"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Bell, PenSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { RouteProgress } from "@/components/router/route-progress";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 只在首页和搜索页显示默认的右侧边栏
  const showDefaultSidebarPaths = ["/", "/search"];
  const showRightSidebar = showDefaultSidebarPaths.includes(pathname);

  return (
    <div className="min-h-screen">
      <RouteProgress />
      <Header />
      <div className="mx-auto max-w-7xl flex pt-8">
        <div className="sticky top-[88px] w-[300px] h-[calc(100vh-88px)]">
          <LeftSidebar className="hidden lg:block" />
        </div>
        {/* 外层容器添加 min-w-0 */}
        <div className="flex-1 flex px-4 min-w-0">
          {/* main 容器添加 min-w-0 和 w-0 */}
          <main className="flex-1 ml-4 min-w-0 w-0">
            {/* 确保 p 标签的父容器限制宽度 */}
            {/* <div className="w-full">
              <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt
              </p>
            </div> */}
            <div className="container">{children}</div>
          </main>
          {showRightSidebar && (
            <aside className="w-60 ml-8 flex-shrink-0">
              <RightSidebar />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
