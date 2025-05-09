"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/auth-modal-store";
import { LoginModal } from "@/components/auth/login-modal";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function EmailConfirmPage() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { openLogin } = useAuthModal();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const token = searchParams?.get("token");

  // 使用 useQuery 处理邮箱验证请求
  const { isLoading } = useQuery({
    queryKey: ["confirmEmail", token],
    queryFn: async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("无效的验证链接");
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "无效的验证链接",
        });
        throw new Error("无效的验证链接");
      }

      try {
        const result = await api.users.confirmEmail({ token });

        if (session?.user) {
          await update({
            user: {
              is_email_confirmed: 1,
            },
          });
        }

        setStatus("success");
        toast({
          title: "验证成功",
          description: "您的邮箱已成功验证",
        });

        // 延迟跳转，让用户看到成功提示
        if (session?.user) {
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }

        return result;
      } catch (error) {
        setStatus("error");
        setErrorMessage("此验证链接已失效，可能已被使用或超过 24 小时有效期。");
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "验证链接已失效",
        });
        throw error;
      }
    },
    enabled: !!token, // 只有当 token 存在时才执行查询
    retry: false, // 不重试失败的请求
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: false, // 组件挂载时不重新获取
    refetchOnReconnect: false, // 重新连接时不重新获取
    staleTime: Infinity, // 数据永不过期
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      return await api.users.resendEmail({ token });
    },
    onSuccess: () => {
      toast({
        title: "发送成功",
        description: "新的验证邮件已发送到您的邮箱",
      });
      setCountdown(60);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "发送失败",
        description:
          error instanceof Error ? error.message : "发送验证邮件失败",
      });
    },
    onSettled: () => {
      setIsResending(false);
    },
  });

  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "error" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    resendMutation.mutate();
  };

  return (
    <div className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold">邮箱验证</h1>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {(isLoading || status === "loading") && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>正在验证您的邮箱...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>邮箱验证成功！</p>
              {session?.user ? (
                <p className="text-sm text-muted-foreground">
                  3秒后自动跳转到首页
                </p>
              ) : (
                <Button size="sm" onClick={openLogin}>
                  点击登录
                </Button>
              )}
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-2xl font-bold mb-2">
                !
              </div>
              <div className="space-y-2">
                <p className="text-base text-muted-foreground">
                  {errorMessage}
                </p>
                <Button
                  size="sm"
                  className="mt-4 transition-transform hover:scale-105"
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || isResending}
                >
                  {isResending
                    ? "发送中..."
                    : countdown > 0
                    ? `重新发送 (${countdown}s)`
                    : "重新发送验证邮件"}
                </Button>
              </div>
              <div className="flex gap-4 text-sm mt-4">
                <Link href="/" className="text-primary hover:underline">
                  返回首页
                </Link>
                <span className="text-muted-foreground">|</span>
                <Link href="/support" className="text-primary hover:underline">
                  联系支持
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <LoginModal isRedirect={true} />
    </div>
  );
}
