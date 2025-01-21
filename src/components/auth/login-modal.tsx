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

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;

    setIsValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        // 显示具体的错误信息
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result?.error || "邮箱或密码错误",
        });
        return;
      }
      if (result.error) {
        // 显示具体的错误信息
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result?.error || "邮箱或密码错误",
        });
        return;
      }

      // 登录成功
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      // 显示具体的错误信息
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-medium">登入</DialogTitle>
          <div className="text-sm text-muted-foreground">
            還沒有賬號？
            <Link href="/register" className="text-primary hover:underline">
              去註冊
            </Link>
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
              className="h-12"
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
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-4">
            <div className="h-[100px] bg-muted rounded-md">
              {/* reCAPTCHA placeholder */}
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full h-12",
                isValid
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
              )}
              disabled={!isValid || isLoading}
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
  );
}
