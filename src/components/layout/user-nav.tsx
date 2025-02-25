"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Settings, Moon, LogOut } from "lucide-react";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { cn } from "@/lib/utils";

interface UserNavProps {
  className?: string;
}

export function UserNav({ className }: UserNavProps) {
  const { data: session } = useSession();
  const { onOpen } = useLoginModal();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  if (!session) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onOpen}
        className={className}
      >
        登录
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-8 w-8 rounded-full",
            "active:scale-95 transition-transform",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={session.user?.image} 
              alt={session.user?.name || ""} 
            />
            <AvatarFallback>
              {session.user?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px] p-2" 
        sideOffset={8}
      >
        {/* 用户信息 */}
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={session.user?.image} 
              alt={session.user?.name || ""} 
            />
            <AvatarFallback>
              {session.user?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {session.user?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.user?.email}
            </span>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="mt-2">
          <DropdownMenuItem asChild>
            <Link 
              href="/me/profile" 
              className="flex items-center py-2"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>基本资料</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link 
              href="/me/settings" 
              className="flex items-center py-2"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>个人设定</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="py-2">
            <Moon className="mr-2 h-4 w-4" />
            <span>夜间模式</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="text-red-600 py-2"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>登出</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
