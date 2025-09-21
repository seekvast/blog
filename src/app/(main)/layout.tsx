"use client";

import * as React from "react";
import { Suspense, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/router/route-progress";
import dynamic from "next/dynamic";
import { sidebarRegistry } from "@/components/layout/sidebar-components";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Plus } from "lucide-react";
import { usePostEditorStore } from "@/store/post-editor";
import { GlobalNsfwWarning } from "@/components/nsfw/global-nsfw-warning";
import { CreateBoardModal } from "@/components/board/create-board-modal";
import { languages } from "@/i18n/settings";

const CreatePostModal = dynamic(
  () => import("@/components/post/create-post-modal"),
  { ssr: false }
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathnameWithLocale = usePathname();
  const { setIsVisible } = usePostEditorStore();
  const [isCreateBoardModalOpen, setCreateBoardModalOpen] =
    React.useState(false);

  const pathname = useMemo(() => {
    if (!pathnameWithLocale) return "/";
    const parts = pathnameWithLocale.split("/");
    if (parts.length > 1 && languages.includes(parts[1])) {
      return `/${parts.slice(2).join("/")}`;
    }
    return pathnameWithLocale;
  }, [pathnameWithLocale]);

  const getPageType = (path: string): keyof typeof sidebarRegistry => {
    if (/^\/b\/[^/]+\/settings/.test(path)) {
      return "boardSettings";
    }
    if (path.startsWith("/u")) {
      return "user";
    }
    if (path.startsWith("/b")) {
      return "boards";
    }
    return "default";
  };

  const pageType = getPageType(pathname);
  const { left: LeftSidebarComponent, right: RightSidebar } =
    sidebarRegistry[pageType];
  const showDefaultSidebarPaths = ["/", "/following", "/bookmarked"];
  const showRightSidebar = showDefaultSidebarPaths.includes(pathname);

  const handleFabClick = () => {
    if (pathname.startsWith("/b")) {
      setCreateBoardModalOpen(true);
    } else {
      setIsVisible(true);
    }
  };

  const fabVisiblePaths = ["/", "/following", "/bookmarked"];
  const showFab =
    fabVisiblePaths.includes(pathname) || pathname.startsWith("/b");

  return (
    <div className="min-h-screen flex flex-col">
      <RouteProgress />
      <GlobalNsfwWarning />
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="mx-auto w-full lg:max-w-7xl flex flex-col lg:flex-row pt-2 lg:pt-4">
          {LeftSidebarComponent && (
            <aside className="hidden lg:block lg:w-[240px] xl:w-[280px] flex-shrink-0 px-4">
              <LeftSidebarComponent />
            </aside>
          )}

          <main className="flex-1 min-w-0 px-4 pb-16 lg:pb-8">{children}</main>

          {showRightSidebar && RightSidebar && (
            <aside className="hidden lg:block lg:w-[240px] xl:w-[280px] flex-shrink-0 lg:px-4">
              <RightSidebar />
            </aside>
          )}
        </div>
      </div>

      {showFab && (
        <button
          className={cn(
            "fixed right-4 bottom-20 lg:hidden z-9",
            "flex items-center justify-center w-14 h-14",
            "bg-primary text-primary-foreground rounded-full shadow-lg",
            "hover:bg-primary/90 active:scale-95",
            "transition-all duration-200",
            "touch-none"
          )}
          onClick={handleFabClick}
          onTouchStart={(e) => {
            e.preventDefault();
            handleFabClick();
          }}
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>
      )}

      <MobileNav />
      <LoginModal />
      <RegisterModal />
      <Suspense fallback={null}>
        <CreatePostModal />
      </Suspense>
      <CreateBoardModal
        open={isCreateBoardModalOpen}
        onOpenChange={setCreateBoardModalOpen}
      />
    </div>
  );
}
