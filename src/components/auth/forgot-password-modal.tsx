"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useCountdown } from "@/store/countdown-store";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onBack,
}: ForgotPasswordModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { startCountdown } = useCountdown("forgot-password");

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    setIsValid(isEmailValid);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading || !turnstileToken) return;

    setIsLoading(true);

    try {
      await api.auth.forgot({
        email,
        turnstile_token: turnstileToken,
      });

      setIsSuccess(true);
      setEmail("");
      setTurnstileToken(null);
      setIsValid(false);
      startCountdown(60);
    } catch (error) {
      toast({
        variant: "default",
        title: "发送失败",
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

  const resetFormData = () => {
    setEmail("");
    setTurnstileToken(null);
    setIsValid(false);
    setIsSuccess(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!open) {
      timeoutId = setTimeout(() => {
        resetFormData();
      }, 300);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-[480px] p-8">
        {!isSuccess ? (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-medium">
                忘记密码
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                请输入忘记密码的邮箱
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-neutral-500">
                  邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入电子邮箱"
                  className="h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                      提交中...
                    </>
                  ) : (
                    "继续"
                  )}
                </Button>
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={onBack}
                    disabled={isLoading}
                  >
                    返回登录
                  </Button>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/forgot-password.svg"
                alt="邮件已发送"
                width={180}
                height={180}
                className="mb-4"
              />
              <h2 className="text-2xl font-medium mb-4">邮件已发送</h2>
              <p className="text-center text-muted-foreground mb-8">
                若該信箱已註冊，我們會寄出密碼重設確認信。請檢查收件匣並依照指示完成更改。
              </p>
            </div>
            <Button
              type="button"
              className="w-full h-12"
              onClick={() => {
                onOpenChange(false);
                resetFormData();
              }}
            >
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
