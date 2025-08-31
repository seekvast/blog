"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthModal } from "./auth-modal-store";
import { api } from "@/lib/api";
import { Turnstile } from "@marsidev/react-turnstile";
import { ForgotPasswordModal } from "./forgot-password-modal";
import { useCountdown } from "@/store/countdown-store";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { remainingSeconds, isActive, startCountdown } =
    useCountdown("forgot-password");
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [apiError, setApiError] = useState<{
    code: number;
    message: string;
    data: any;
  } | null>(null);

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

      if (result && !result.ok && result.error) {
        let errorData;
        try {
          errorData = JSON.parse(result.error);
        } catch (e) {
          // 解析失败，直接显示原始错误
          toast({
            variant: "default",
            title: "登录失败",
            description: result.error,
          });
          return;
        }

        if (errorData.code === 4402) {
          setApiError(errorData);
          setShowApiErrorModal(true);
        } else {
          toast({
            variant: "default",
            title: "登录失败",
            description: errorData.message || "邮箱或密码错误",
          });
        }
        return;
      }

      // 登录成功后，auth-provider 会自动获取草稿数据，无需重复请求

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
        variant: "default",
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
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-3xl font-medium">登入</DialogTitle>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="請輸入密碼"
                  className="h-12 text-base pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                type="button"
                className={`text-sm font-medium text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => {
                  setIsForgotPasswordOpen(true);
                }}
              >
                忘记密码？
              </button>
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
                    size: "flexible",
                  }}
                  className="flex justify-center items-center"
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
      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        onBack={() => setIsForgotPasswordOpen(false)}
      />
      <Dialog open={showApiErrorModal} onOpenChange={setShowApiErrorModal}>
        <DialogContent className="sm:max-w-sm">
          <div className="w-full break-all">
            <div className="text-center p-4">
              <Image
                src="/undraw_cancel.svg"
                alt="Error illustration"
                width={180}
                height={220}
                className="mb-4 mx-auto"
              />
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold mb-2">
                  {apiError?.message || "账号已被暂时停用"}
                </DialogTitle>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {apiError?.data?.suspend_reason
                    ? `你因「${apiError.data.suspend_reason}」屡次或严重违反我们的《内容政策》，已将你的账号永久停用。`
                    : "你的账号因违反社区规定已被停用。"}
                </div>
              </DialogHeader>
              <Button
                onClick={() => setShowApiErrorModal(false)}
                className="w-full mt-6"
              >
                我知道了
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
