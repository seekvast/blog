"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useAuthModal } from "@/components/auth/auth-modal-store";
import { LoginModal } from "@/components/auth/login-modal";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // 验证表单
  const validateForm = () => {
    let isValid = true;

    // 密码验证规则
    const passwordRegex = /^[0-9a-zA-Z!@#$%^&*\-_]{8,100}$/;

    if (password.length < 8) {
      setPasswordError("密碼至少需要8個字符");
      isValid = false;
    } else if (password.length > 100) {
      setPasswordError("密碼最多100個字符");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError("密碼至少8個字符，可輸入大小寫字母、數字和特殊字符");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("兩次輸入的密碼不一致");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) return;
    if (!token) {
      toast({
        variant: "default",
        title: "重置失敗",
        description: "無效的重置鏈接，請重新獲取",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 调用重置密码API
      await api.auth.reset({
        token,
        password,
        confirm_password: confirmPassword,
      });

      // 設置成功狀態，顯示成功界面
      setIsSuccess(true);
    } catch (error) {
      toast({
        variant: "default",
        title: "重置失敗",
        description:
          error instanceof Error
            ? error.message
                .split("\n")
                .map((msg, i) => <div key={i}>{msg}</div>)
            : "伺服器錯誤，請稍後重試",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm border border-border">
          {!isSuccess ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-medium">重置密碼</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  請設置新密碼
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm text-neutral-500"
                    >
                      新密碼
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="請輸入新密碼"
                      className="h-12 text-base mt-1"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    {passwordError && (
                      <p className="text-sm text-destructive mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm text-neutral-500"
                    >
                      確認密碼
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="請再次輸入新密碼"
                      className="h-12 text-base mt-1"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    {confirmPasswordError && (
                      <p className="text-sm text-destructive mt-1">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12",
                    password && confirmPassword && password === confirmPassword
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-400"
                  )}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    isLoading
                  }
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
                    "重置密碼"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <h2 className="text-2xl font-medium mb-2">密碼重置成功</h2>
              <p className="text-center text-muted-foreground mb-8">
                您的密碼已成功重置，現在可以使用新密碼登錄
              </p>
              <Button
                type="button"
                className="w-full h-12"
                onClick={() => router.push("/")}
              >
                返回首頁
              </Button>
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-primary hover:underline p-0 h-auto"
                  onClick={() => openLogin()}
                >
                  立即登錄
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <LoginModal isRedirect={true} />
    </>
  );
}
