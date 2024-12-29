"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
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
import { cn } from "@/lib/utils";
import { useState } from "react";
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
import { http } from "@/lib/request";

export function Header() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogout = async () => {
      try {
      if (!session?.accessToken) {
        throw new Error('未登录');
      }

      // 调用后端登出 API
      await http.get('/api/logout', session.accessToken);
      
      // 调用 NextAuth 登出
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登出失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  };

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
          <div className="ml-auto flex items-center gap-4">
            {session ? (
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
                      <AvatarImage src={session.user?.avatar_url || ""} />
                      <AvatarFallback>
                        {session.user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer">
                      <User2 className="mr-2 h-4 w-4" />
                      <span>基本资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>个人设定</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Moon className="mr-2 h-4 w-4" />
                      <span>夜间模式</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
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
