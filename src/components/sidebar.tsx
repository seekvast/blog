"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Home,
  Heart,
  LayoutGrid,
  BookmarkIcon,
  PenSquare,
  Clock,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MENU_ITEMS = [
  { href: "/", icon: Home, label: "nav.home" },
  { href: "/followers", icon: Heart, label: "nav.follow" },
  { href: "/boards", icon: LayoutGrid, label: "nav.boards" },
  { href: "/bookmarked", icon: BookmarkIcon, label: "nav.bookmark" },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-[300px] flex-col">
      <nav className="space-y-1 px-8 py-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start">
                <Icon className="mr-2 h-5 w-5" />
                {t(item.label)}
              </Button>
            </Link>
          );
        })}
        <Button className="mt-4 w-full">
          <PenSquare className="mr-2 h-5 w-5" />
          {t("nav.newPost")}
        </Button>
      </nav>

      {/* 推荐看板 */}
      <div className="border-t px-8 py-4">
        <h3 className="mb-4 text-sm font-medium">推荐看板</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>色</AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-1">
                <span className="text-sm">色图交流</span>
                <Badge variant="secondary" className="bg-red-50 text-red-600">
                  成人
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">99</span>
            </div>
            <Button variant="outline" size="sm">
              加入
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>军</AvatarFallback>
              </Avatar>
              <span className="text-sm">军播社区</span>
              <span className="text-xs text-muted-foreground">99</span>
            </div>
            <Button variant="outline" size="sm">
              加入
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>全</AvatarFallback>
              </Avatar>
              <span className="text-sm">全球主机交流论坛</span>
              <span className="text-xs text-muted-foreground">9929</span>
            </div>
            <Button variant="outline" size="sm" disabled>
              已加入
            </Button>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-auto space-y-6 border-t px-4 pb-6 pt-6">
        <div className="space-y-2">
          <div className="text-xl font-bold">Kater</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              服務條款
            </Link>
            <Link href="#" className="hover:text-foreground">
              隱私權政策
            </Link>
            <Link href="#" className="hover:text-foreground">
              聯絡我們
            </Link>
            <Link href="#" className="hover:text-foreground">
              說明中心
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border">
              <span className="text-xs">A</span>
            </div>
            繁體中文（台灣）
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border">
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
                className="lucide lucide-clock"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            自動
          </div>
        </div>
      </div>
    </aside>
  );
}
