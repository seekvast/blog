"use client";

import * as React from "react";
import { useState, Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Plus, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CreateBoardModal } from "@/components/board/create-board-modal";
import { Icon } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";

// 懒加载 CreatePostModal 组件
const CreatePostModal = React.lazy(
  () => import("@/components/post/create-post-modal")
);

interface NavItem {
  title: string;
  href: string;
  icon: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "首页",
    href: "/",
    icon: "home",
  },
  {
    title: "关注",
    href: "/following",
    icon: "person",
  },
  {
    title: "看板",
    href: "/boards",
    icon: "view_module",
  },
  {
    title: "书签",
    href: "/bookmarks",
    icon: "bookmark",
  },
];

interface LeftSidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function LeftSidebar({ className, ...props }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const handleLanguageChange = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === "zh-TW" ? "en" : "zh-TW";
    i18n.changeLanguage(newLang);
  };

  const handlePublishClick = () => {
    // 在看板列表页面，显示创建看板的模态框
    if (pathname === "/boards") {
      setCreateBoardOpen(true);
    }
    // 在其他页面，显示发布文章的模态框
    else {
      setCreatePostOpen(true);
    }
  };

  return (
    <aside
      className={cn("flex w-full flex-col gap-4 h-full pb-12", className)}
      {...props}
    >
      <div className="flex flex-col gap-4 pr-4">
        {/* 主导航 */}
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  name={item.icon}
                  className="mr-2 text-[20px] leading-none"
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* 创建看板按钮 */}
        <div className="px-3 py-2">
          <Button className="w-full text-lg" onClick={handlePublishClick}>
            {pathname === "/boards"
              ? t("common.createBoard")
              : t("common.publish")}
          </Button>
          <CreateBoardModal
            open={createBoardOpen}
            onOpenChange={setCreateBoardOpen}
          />
          {createPostOpen && (
            <Suspense fallback={null}>
              <CreatePostModal
                open={createPostOpen}
                onOpenChange={setCreatePostOpen}
              />
            </Suspense>
          )}
        </div>

        {/* 推荐看板 */}
        <div className="my-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-medium">推薦看板</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </Button>
          </div>
          <div className="border-y py-3 space-y-1">
            {[
              {
                name: "FTTT",
                members: 1,
                letter: "F",
              },
              {
                name: "NSFW",
                members: 12922,
                letter: "N",
                tag: "成人",
              },
              {
                name: "TFF11",
                members: 1,
                letter: "T",
              },
            ].map((board) => (
              <div
                key={board.name}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{board.letter}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/boards/${board.name}`}
                        className="text-sm font-medium"
                      >
                        {board.name}
                      </Link>
                      {board.tag && (
                        <span className="rounded bg-red-500 px-1 py-0.5 text-[10px] text-white">
                          {board.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{board.members}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="rounded-full">
                  加入
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 页脚链接 */}
        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              {t("common.termsOfService")}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.contactUs")}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.helpCenter")}
            </Link>
          </div>
          <div className="flex justify-between">
            <div
              className="flex cursor-pointer items-center py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={handleLanguageChange}
            >
              <Icon name="language" className="text-[20px] leading-none" />
              <span className="truncate">{t("common.autoDetectLanguage")}</span>
            </div>
            <div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
