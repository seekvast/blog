"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAuthModal } from "./auth-modal-store";
import { useDraftStore } from "@/store/draft";
import { api } from "@/lib/api";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

interface LoginModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isRedirect?: boolean;
}

export function LoginModal({
  open,
  onOpenChange,
  isRedirect = false,
}: LoginModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoginOpen, closeLogin, openRegister } = useAuthModal();
  const { setDraft } = useDraftStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 8;

    setIsValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading || !turnstileToken) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        turnstile_token: turnstileToken,
      });

      if (!result?.ok) {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result?.error || "邮箱或密码错误",
        });
        return;
      }
      if (result.error) {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result?.error || "邮箱或密码错误",
        });
        return;
      }

      // 登录成功后获取草稿
      try {
        const draft = await api.discussions.draft();
        if (draft) {
          setDraft(draft);
        }
      } catch (error) {
        console.error("获取草稿失败:", error);
      }

      if (onOpenChange) {
        onOpenChange(false);
      } else {
        closeLogin();
      }
      if (isRedirect) {
        router.push("/");
      } else {
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description:
          error instanceof Error
            ? error.message
                .split("\n")
                .map((msg, i) => <div key={i}>{msg}</div>)
            : "服务器错误，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open !== undefined ? open : isLoginOpen}
        onOpenChange={(value) => {
          if (onOpenChange) {
            onOpenChange(value);
          } else {
            if (!value) closeLogin();
          }
        }}
      >
        <DialogContent className="max-w-[480px] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-medium">登入</DialogTitle>
            <div className="text-sm text-muted-foreground">
              還沒有賬號？
              <Button
                variant="link"
                className="px-1 h-auto"
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false);
                  } else {
                    closeLogin();
                  }
                  openRegister();
                }}
              >
                去註冊
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-neutral-500">
                郵箱
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="請輸入電子郵箱"
                className="h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-neutral-500">
                密碼
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                className="h-12 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-4">
              <div className="cf-turnstile flex justify-center">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                  }}
                  onError={(error) => {
                    setTurnstileToken(null);
                  }}
                  onExpire={() => {
                    setTurnstileToken(null);
                  }}
                  options={{
                    theme: "auto",
                    size: "normal",
                  }}
                  className="flex justify-center items-center bg-muted rounded-md"
                />
              </div>
              <Button
                type="submit"
                className={cn(
                  "w-full h-12",
                  isValid
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
                )}
                disabled={!isValid || isLoading || !turnstileToken}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    登入中...
                  </>
                ) : (
                  "登入"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
