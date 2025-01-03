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
  const showDefaultSidebarPaths = ['/', '/search'];
  const showRightSidebar = showDefaultSidebarPaths.includes(pathname);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto flex justify-center pt-8">
        <div className="w-[1360px] flex justify-between px-4 relative">
          <div className="sticky top-[88px] min-w-[300px] h-[calc(100vh-88px)]">
            <LeftSidebar className="hidden lg:block" />
          </div>
          <main className="w-full ml-8">{children}</main>
          {showRightSidebar && (
            <RightSidebar className="hidden lg:block mt-8 ml-8" />
          )}
        </div>
      </div>
    </div>
  );
}
