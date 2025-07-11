"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useInterestSelection } from "@/components/providers/interest-selection-provider";
import { signOut } from "next-auth/react";
import { PenSquare, LogOut, Settings, User2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthModal } from "@/components/auth/auth-modal-store";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostEditorStore } from "@/store/post-editor";
import { cn } from "@/lib/utils";
import { useDraftStore } from "@/store/draft";
import { Badge } from "@/components/ui/badge";
import { SearchPopover } from "@/components/search/search-popover";
import { SearchMobile } from "@/components/search/search-mobile";
import { NotificationPopover } from "@/components/notification/notification-popover";
import { useEmailVerificationGuard } from "@/hooks/use-email-verification-guard";
import { EmailVerificationRequiredFeature } from "@/config/email-verification";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { openRegister, openLogin } = useAuthModal();
  const { openInterestSelection } = useInterestSelection();
  const { hasUnsavedContent, isVisible, onClose, setIsVisible, setOpenFrom } =
    usePostEditorStore();
  const { hasDraft } = useDraftStore();
  const { requireEmailVerification } = useEmailVerificationGuard();

  const handleLogoClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) {
        setIsVisible(false);
        onClose?.(false);
        setTimeout(() => {
          router.push("/");
        }, 0);
      }
    },
    [isVisible, onClose, router]
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

  const handleCreatePost = React.useCallback(() => {
    if (!hasDraft) return;
    requireEmailVerification(() => {
      setIsVisible(true);
      setOpenFrom("draft");
    }, EmailVerificationRequiredFeature.CREATE_POST);
  }, [setIsVisible, setOpenFrom, requireEmailVerification, hasDraft]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl flex h-16 md:h-14 px-4">
        <div className="flex justify-between w-full items-center">
          {/* Logo */}
          <div className="flex justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={handleLogoClick}
            >
              <img src="/logo.svg" alt="Kater" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-[240px] mx-3">
            <SearchPopover triggerClassName="w-full hidden lg:flex" />
            <SearchMobile triggerClassName="w-full lg:hidden" />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <>
                <div className="relative hidden md:flex">
                  <button
                    type="button"
                    className="hover:bg-muted hidden md:flex"
                    onClick={handleCreatePost}
                  >
                    <PenSquare className="h-5 w-5" />
                  </button>
                  {hasDraft && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full p-0"
                    />
                  )}
                </div>
                <div className="hidden lg:flex">
                  <NotificationPopover autoLoad={true} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer ring-offset-background transition-opacity hover:opacity-80">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>
                        {user.nickname?.[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href={`/u/${user.username}?hashid=${user.hashid}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <User2 className="mr-2 h-4 w-4" />
                        <span>基本资料</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/u/${user.username}/settings?hashid=${user.hashid}`}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>个人设定</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={openInterestSelection}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      <span>兴趣选择</span>
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
                <button
                  type="button"
                  className="text-muted-foreground"
                  onClick={openRegister}
                >
                  註冊
                </button>
                <button className="text-muted-foreground" onClick={openLogin}>
                  登入
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
