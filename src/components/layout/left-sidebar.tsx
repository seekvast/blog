"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Home, LayoutGrid, Bookmark, Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostEditorStore } from "@/store/post-editor";
import { CreateBoardModal } from "@/components/board/create-board-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Board } from "@/types/board";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { RecommendedBoardItem } from "@/components/board/recommended-board-item";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  auth?: boolean;
}

const NavItemLink = ({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  const className = cn(
    "inline-flex items-center rounded-full px-6 py-2 text-base transition-colors max-w-fit",
    isActive
      ? "bg-accent font-bold text-primary"
      : "hover:bg-accent hover:text-accent-foreground"
  );

  const content = (
    <>
      <item.icon className="mr-2 h-4 w-4" />
      {t(item.titleKey)}
    </>
  );

  if (item.auth) {
    return (
      <div
        className={cn(className, "cursor-pointer")}
        onClick={() => requireAuth(() => router.push(item.href))}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
};

export function LeftSidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const { requireAuthAndEmailVerification } = useRequireAuth();
  const { setIsVisible, setOpenFrom } = usePostEditorStore();
  const queryClient = useQueryClient();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  const mainNavItems: NavItem[] = useMemo(
    () => [
      { titleKey: "home", href: "/", icon: Home },
      {
        titleKey: "following",
        href: "/following",
        icon: Heart,
        auth: true,
      },
      { titleKey: "boards", href: "/b", icon: LayoutGrid },
      {
        titleKey: "bookmarks",
        href: "/bookmarked",
        icon: Bookmark,
        auth: true,
      },
    ],
    []
  );

  const { data: boards } = useQuery({
    queryKey: ["recommend-boards"],
    queryFn: () => api.boards.recommend({}),
  });

  const { mutate: refreshBoards } = useMutation({
    mutationFn: () => api.boards.recommend({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
    },
  });

  const handlePublishClick = () => {
    requireAuthAndEmailVerification(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const boardIdParam = urlParams.get("bid");
      const childParam = urlParams.get("child");

      if (boardIdParam) {
        const boardId = parseInt(boardIdParam, 10);
        const childId = childParam ? parseInt(childParam, 10) : undefined;
        if (!isNaN(boardId)) {
          usePostEditorStore.setState({
            boardPreselect: {
              boardId: boardId,
              boardChildId: childId,
            },
          });
        }
      }
      setIsVisible(true);
      setOpenFrom("create");
    });
  };

  const isBoardsPage = pathname.endsWith("/b");

  return (
    <aside
      className={cn("flex h-full w-full flex-col gap-4 pb-12", className)}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="py-2">
          {isBoardsPage ? (
            <Button
              className="w-full text-lg font-bold"
              onClick={() =>
                requireAuthAndEmailVerification(() => setCreateBoardOpen(true))
              }
            >
              {t("createBoard")}
            </Button>
          ) : (
            <Button
              className="w-full text-lg font-bold"
              onClick={handlePublishClick}
            >
              {t("publish")}
            </Button>
          )}
        </div>

        <CreateBoardModal
          open={createBoardOpen}
          onOpenChange={setCreateBoardOpen}
        />

        <div>
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-sm font-medium">{t("recommendedBoards")}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => refreshBoards()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 border-y py-3">
            {boards?.map((board: Board) => (
              <RecommendedBoardItem
                key={board.id}
                board={board}
                onSubscribeSuccess={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["recommend-boards"],
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex w-full text-sm text-muted-foreground">
            <Link
              href="/terms"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("termsOfService")}
            </Link>
            <Link
              href="/privacy"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="/contact"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("contactUs")}
            </Link>
            <Link
              href="/help"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("helpCenter")}
            </Link>
          </div>
          <div className="flex justify-between">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
