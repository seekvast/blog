"use client";

import { ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  EmailVerificationRequiredFeature,
  getFeatureRestriction,
} from "@/config/email-verification";

interface EmailVerificationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: EmailVerificationRequiredFeature;
  requireEmailVerification?: boolean;
  showCard?: boolean; // 是否显示卡片样式的提示
}

/**
 * 邮箱验证守卫组件
 *
 * @example
 * // 基础用法
 * <EmailVerificationGuard>
 *   <CreatePostButton />
 * </EmailVerificationGuard>
 *
 * @example
 * // 指定功能类型
 * <EmailVerificationGuard feature={EmailVerificationRequiredFeature.CREATE_POST}>
 *   <CreatePostButton />
 * </EmailVerificationGuard>
 *
 * @example
 * // 自定义fallback
 * <EmailVerificationGuard fallback={<div>请验证邮箱</div>}>
 *   <CreatePostButton />
 * </EmailVerificationGuard>
 */
export function EmailVerificationGuard({
  children,
  fallback,
  feature,
  requireEmailVerification = true,
  showCard = true,
}: EmailVerificationGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 如果正在加载，显示加载状态
  if (loading) {
    return null;
  }

  // 如果用户未登录，显示登录提示
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showCard) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>需要登录</CardTitle>
            <CardDescription>您需要登录后才能使用此功能</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => router.push("/?showLogin=true")}
              className="w-full"
            >
              立即登录
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-2">您需要登录后才能使用此功能</p>
        <Button size="sm" onClick={() => router.push("/?showLogin=true")}>
          立即登录
        </Button>
      </div>
    );
  }

  // 如果不需要邮箱验证，直接显示子组件
  if (!requireEmailVerification) {
    return <>{children}</>;
  }

  // 如果邮箱已验证，显示子组件
  if (user.is_email_confirmed === 1) {
    return <>{children}</>;
  }

  // 邮箱未验证，显示提示
  if (fallback) {
    return <>{fallback}</>;
  }

  // 获取功能限制信息
  const restriction = feature ? getFeatureRestriction(feature) : null;
  const message = restriction?.message || "此功能需要验证邮箱";

  if (showCard) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <CardTitle>需要验证邮箱</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            验证邮件已发送至 <span className="font-medium">{user.email}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/email/confirm")}
              className="flex-1"
            >
              查看验证状态
            </Button>
            <Button
              onClick={() => router.push("/email/confirm")}
              className="flex-1"
            >
              重新发送邮件
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center p-4 border rounded-lg bg-amber-50 border-amber-200">
      <Mail className="h-8 w-8 mx-auto mb-2 text-amber-500" />
      <p className="text-sm font-medium mb-1">需要验证邮箱</p>
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/email/confirm")}
        >
          查看验证状态
        </Button>
        <Button size="sm" onClick={() => router.push("/email/confirm")}>
          重新发送邮件
        </Button>
      </div>
    </div>
  );
}
