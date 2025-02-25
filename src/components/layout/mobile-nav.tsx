"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Layout, Bookmark, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "首页",
    href: "/",
    icon: Home
  },
  {
    label: "关注",
    href: "/following",
    icon: Heart
  },
  {
    label: "看板",
    href: "/b",
    icon: Layout
  },
  {
    label: "书签",
    href: "/bookmarks",
    icon: Bookmark
  },
  {
    label: "消息",
    href: "/notifications",
    icon: Bell,
    badge: 25
  }
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "flex h-14 items-center justify-around",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-t safe-area-bottom",
      className
    )}>
      {/* 导航项 */}
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center",
            "w-16 h-14 space-y-0.5", // 调整间距以匹配UI
            "active:opacity-70",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="relative">
            <item.icon className="h-5 w-5" />
            {item.badge && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </div>
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}

      {/* 发帖按钮 */}
      <Button
        size="sm"
        className="fixed right-4 bottom-20 lg:hidden z-50 rounded-full h-12 w-12 p-0 shadow-lg"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </nav>
  );
}
