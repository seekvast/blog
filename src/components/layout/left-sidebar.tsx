"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  Bookmark,
  Heart,
  Users,
  Globe,
  RotateCcw,
  Check,
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
import { BoardActionButton } from "@/components/board/board-action-button";
import { BoardApprovalMode } from "@/constants/board-approval-mode";
import { Board } from "@/types/board";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useBoardActions } from "@/hooks/use-board-actions";
import { useLanguageName } from "@/hooks/use-language-name";
import { useEmailVerificationGuard } from "@/hooks/use-email-verification-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecommendedBoardItem } from "@/components/board/recommended-board-item";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  auth?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    title: "首页",
    href: "/",
    icon: Home,
    auth: false,
  },
  {
    title: "关注",
    href: "/following",
    icon: Heart,
    auth: true,
  },
  {
    title: "看板",
    href: "/b",
    icon: LayoutGrid,
    auth: false,
  },
  {
    title: "书签",
    href: "/bookmarked",
    icon: Bookmark,
    auth: true,
  },
];

interface LeftSidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function LeftSidebar({ className, ...props }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { requireAuth, requireAuthAndEmailVerification } = useRequireAuth();
  const { handleSubscribe } = useBoardActions();
  const { requireEmailVerification } = useEmailVerificationGuard();
  const {
    getCurrentLanguageName,
    getCurrentLanguageCode,
    changeLanguage,
    languages,
  } = useLanguageName();
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [subscribeBoardOpen, setSubscribeBoardOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const { setIsVisible, setOpenFrom } = usePostEditorStore();
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

  const handlePublishClick = () => {
    // 在看板列表页面，显示创建看板的模态框
    if (pathname === "/b") {
      requireAuthAndEmailVerification(() => setCreateBoardOpen(true));
    }
    // 在其他页面，显示发布文章的模态框
    else {
      requireAuthAndEmailVerification(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const boardIdParam = urlParams.get("bid");
        const childParam = urlParams.get("child");

        if (boardIdParam) {
          const boardId = parseInt(boardIdParam, 10);
          const childId = childParam ? parseInt(childParam, 10) : undefined;

          if (!isNaN(boardId)) {
            // 设置发布文章时的看板ID和子看板ID
            usePostEditorStore.setState({
              boardPreselect: {
                boardId: boardId,
                boardChildId: !isNaN(Number(childId))
                  ? Number(childId)
                  : undefined,
              },
            });
          }
        }
        setIsVisible(true);
        setOpenFrom("create");
      });
    }
  };

  const handleSubscribeSuccess = () => {
    // 订阅成功后刷新数据
    queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
  };

  return (
    <aside
      className={cn("flex w-full flex-col gap-4 pb-12 h-full", className)}
      {...props}
    >
      <div className="flex flex-col gap-4">
        {/* 主导航 */}
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) =>
            item.auth ? (
              <div
                key={item.href}
                className={cn(
                  "inline-flex items-center px-6 py-2 text-base rounded-full transition-colors cursor-pointer max-w-fit",
                  pathname === item.href
                    ? "bg-accent text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => requireAuth(() => router.push(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-6 py-2 text-base rounded-full transition-colors max-w-fit",
                  pathname === item.href
                    ? "bg-accent text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            )
          )}
        </nav>

        {/* 创建看板按钮 */}
        <div className="py-2">
          <Button
            className="w-full text-lg font-bold"
            onClick={handlePublishClick}
          >
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
        <div>
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
              <RecommendedBoardItem
                key={board.id}
                board={board}
                onSubscribeSuccess={handleSubscribeSuccess}
              />
            ))}
          </div>
        </div>

        {/* 加入看板对话框已移至 BoardActionButton 组件内部 */}

        {/* 页脚链接 */}
        <div className="mt-auto space-y-4">
          <div className="flex w-full text-sm text-muted-foreground">
            <Link
              href="https://support.kater.me/docs/policy/terms-of-service"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("common.termsOfService", { defaultValue: "服务条款" })}
            </Link>
            <Link
              href="https://support.kater.me/docs/policy/privacy-policy"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("common.privacyPolicy", { defaultValue: "隐私政策" })}
            </Link>
            <Link
              href="https://support.kater.me/docs/help"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("common.contactUs", { defaultValue: "联系我们" })}
            </Link>
            <Link
              href="https://support.kater.me/"
              className="flex-1 text-center hover:text-foreground"
            >
              {t("common.helpCenter", { defaultValue: "说明中心" })}
            </Link>
          </div>
          <div className="flex justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Globe className="mr-2 leading-none " />
                  <span className="truncate">{getCurrentLanguageName()}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="flex justify-between"
                  >
                    {lang.name}
                    {getCurrentLanguageCode() === lang.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
