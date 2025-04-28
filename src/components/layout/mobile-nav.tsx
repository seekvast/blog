"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Heart, LayoutGrid, Bookmark } from "lucide-react";;
import { LucideIcon } from "lucide-react";
import { NotificationIcon } from "@/components/notification/notification-icon";
type NavItem = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  isPopover?: boolean;
};

const navItems: NavItem[] = [
  {
    label: "首页",
    href: "/",
    icon: Home,
  },
  {
    label: "关注",
    href: "/following",
    icon: Heart,
  },
  {
    label: "看板",
    href: "/b",
    icon: LayoutGrid,
  },
  {
    label: "书签",
    href: "/bookmarked",
    icon: Bookmark,
  },
  {
    label: "消息",
    href: "/notifications",
    customIcon: <NotificationIcon />,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        "flex h-[var(--mobile-nav-height)] items-center justify-around",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-t safe-area-bottom"
      )}
    >
      {navItems.map((item) =>
        item.isPopover ? (
          <Link
            href="/notifications"
            className="flex flex-col items-center justify-center w-16 h-full py-1"
          >
            <NotificationIcon />
            <span className="text-xs font-medium text-muted-foreground">
              消息
            </span>
          </Link>
        ) : (
          <Link
            key={item.href}
            href={item.href || "/"}
            className={cn(
              "flex flex-col items-center justify-center",
              "w-16 h-full py-1",
              "text-xs font-medium transition-colors",
              "hover:text-primary",
              pathname === item.href
                ? [
                    "text-primary",
                    "after:absolute after:bottom-[2px] after:w-1 after:h-1",
                    "after:rounded-full after:bg-primary",
                  ]
                : "text-muted-foreground"
            )}
          >
            {item.icon ? (
              <item.icon className="h-5 w-5 mb-0.5" />
            ) : (
              item.customIcon
            )}
            <span>{item.label}</span>
          </Link>
        )
      )}
    </nav>
  );
}
