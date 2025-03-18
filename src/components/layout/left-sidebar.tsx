"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  Bookmark,
  Heart,
  Users,
  Languages,
  Globe,
  Plus,
  PenSquare,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { usePostEditorStore } from "@/store/post-editor";
import { CreateBoardModal } from "@/components/board/create-board-modal";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

const mainNavItems: NavItem[] = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "关注",
    href: "/following",
    icon: Heart,
  },
  {
    title: "看板",
    href: "/b",
    icon: LayoutGrid,
  },
  {
    title: "书签",
    href: "/bookmarked",
    icon: Bookmark,
  },
];

interface LeftSidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function LeftSidebar({ className, ...props }: LeftSidebarProps) {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const { setIsVisible } = usePostEditorStore();
  const queryClient = useQueryClient();

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

  const { mutate: joinBoard } = useMutation({
    mutationFn: (boardId: number) => api.boards.join({ board_id: boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
    },
  });

  const handlePublishClick = () => {
    // 在看板列表页面，显示创建看板的模态框
    if (pathname === "/b") {
      setCreateBoardOpen(true);
    }
    // 在其他页面，显示发布文章的模态框
    else {
      setIsVisible(true);
    }
  };

  const handleLanguageChange = () => {
    const currentLang = i18n.language;
    if (currentLang === "zh-Hans-CN") {
      i18n.changeLanguage("zh-Hant-TW");
    } else if (currentLang === "zh-Hant-TW") {
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("zh-Hans-CN");
    }
  };

  return (
    <aside
      className={cn("flex w-full flex-col gap-4 pb-12 h-full", className)}
      {...props}
    >
      <div className="flex flex-col gap-4">
        {/* 主导航 */}
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-2 text-[20px] leading-none" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* 创建看板按钮 */}
        <div className="px-3 py-2">
          <Button className="w-full text-lg" onClick={handlePublishClick}>
            {pathname === "/b"
              ? t("common.createBoard", { defaultValue: "创建看板" })
              : t("common.publish", { defaultValue: "发表文章" })}
          </Button>
        </div>

        <CreateBoardModal
          open={createBoardOpen}
          onOpenChange={setCreateBoardOpen}
        />

        {/* 推荐看板 */}
        <div className="my-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-medium">推薦看板</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RotateCcw
                className="h-4 w-4 cursor-pointer"
                onClick={() => refreshBoards()}
              />
            </Button>
          </div>
          <div className="border-y py-3 space-y-1">
            {boards?.map((board) => (
              <div
                key={board.name}
                className="flex items-center justify-between rounded-lg px-2 py-2"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/b/${board.name}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {board.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/b/${board.slug}`}
                        className="text-sm font-medium"
                      >
                        {board.name}
                      </Link>
                      {board.is_nsfw === 1 && (
                        <Badge variant="destructive" className="h-5">
                          成人
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{board.users_count}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    joinBoard(board.id);
                  }}
                >
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
              {t("common.termsOfService", { defaultValue: "服务条款" })}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.privacyPolicy", { defaultValue: "隐私政策" })}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.contactUs", { defaultValue: "联系我们" })}
            </Link>
            <Link href="#" className="hover:text-foreground">
              {t("common.helpCenter", { defaultValue: "帮助中心" })}
            </Link>
          </div>
          <div className="flex justify-between">
            <div
              className="flex cursor-pointer items-center py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={handleLanguageChange}
            >
              <Globe className="mr-2 leading-none" />
              <span className="truncate">
                {t("common.autoDetectLanguage", {
                  defaultValue: "自动检测语言",
                })}
              </span>
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
