"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { signOut } from "next-auth/react";
import {
  Search,
  Bell,
  PenSquare,
  Moon,
  LogOut,
  Settings,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RegisterModal } from "@/components/auth/register-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { useToast } from "@/components/ui/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { usePostEditorStore } from "@/store/post-editor";

export function Header() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const { hasUnsavedContent, isVisible, onClose, setIsVisible } =
    usePostEditorStore();

  const handleLogoClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) {
        setIsVisible(false);
        e.preventDefault();
        onClose?.(false);
      }
    },
    [isVisible, onClose]
  );

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl flex h-14 px-4">
        <div className="flex justify-between w-full items-center ">
          {/* Logo */}
          <div className="flex justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={handleLogoClick}
            >
              <img src="/logo-g.png" alt="Kater" className="h-8 w--full" />
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
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <PenSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer ring-offset-background transition-opacity hover:opacity-80">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>
                        {user.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href={`/u/${user.hashid}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <User2 className="mr-2 h-4 w-4" />
                        <span>基本资料</span>
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>个人设定</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Moon className="mr-2 h-4 w-4" />
                      <span>夜间模式</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>登出</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-base font-normal hover:bg-transparent hover:text-foreground"
                  onClick={() => setRegisterOpen(true)}
                >
                  註冊
                </Button>
                <Button
                  variant="ghost"
                  className="text-base font-normal hover:bg-transparent hover:text-foreground"
                  onClick={() => setLoginOpen(true)}
                >
                  登入
                </Button>
                <RegisterModal
                  open={registerOpen}
                  onOpenChange={setRegisterOpen}
                />
                <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
