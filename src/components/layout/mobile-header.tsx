"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, RotateCw, ChevronLeft } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface MobileHeaderProps {
  className?: string;
  variant?: "home" | "search" | "detail" | "editor";
  title?: string;
  onClose?: () => void;
  onRefresh?: () => void;
  onDrawerOpenChange?: (open: boolean) => void;
}

const navItems = [
  { label: "推荐", href: "/" },
  { label: "追踪", href: "/following" },
  { label: "标签", href: "/tags" },
];

export function MobileHeader({
  className,
  variant = "home",
  title,
  onClose,
  onRefresh,
  onDrawerOpenChange,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (variant === "home") {
    return (
      <nav
        className={cn(
          "grid grid-cols-[1fr_auto] h-12 px-2 border-b",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
      >
        {/* 导航链接 */}
        <div className="grid grid-cols-4 items-center w-[70%]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "h-full inline-flex items-center justify-center",
                "text-sm font-medium transition-colors",
                "hover:text-primary",
                "relative px-2",
                pathname === item.href
                  ? [
                      "text-primary text-base",
                      "after:absolute after:bottom-0 after:left-1/4 after:right-1/4",
                      "after:h-0.5 after:bg-primary",
                    ]
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-2 pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/search")}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    );
  }

  if (variant === "search") {
    return (
      <div className={cn("flex items-center h-12 px-4 border-b", className)}>
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center gap-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="search"
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-8 bg-muted/50"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-primary"
          >
            搜索
          </Button>
        </form>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("flex items-center h-12 px-4 border-b", className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="flex-1 text-center text-sm font-medium">{title}</span>
        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // variant === "editor"
  return (
    <div className={cn("flex items-center h-12 px-4 border-b", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="flex-1 text-center text-sm font-medium">{title}</span>
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
