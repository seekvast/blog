"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Bell, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-[1360px] flex h-14 px-4">
        <div className="flex justify-between w-full items-center ">
          {/* Logo */}
          <div className="flex justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-g.png" alt="Kater" className="h-8 w--full" />
              {/* <span className="text-lg font-bold text-primary">Kater</span> */}
            </Link>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋關鍵字"
                className="pl-8 bg-muted/50 rounded-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <PenSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            {session ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {session.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Button asChild>
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
