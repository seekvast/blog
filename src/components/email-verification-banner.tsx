"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// 常量定义
const COOLDOWN_TIME = 60; // 普通冷却时间（秒）
const MAX_ATTEMPTS = 10; // 5分钟内最大尝试次数
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5分钟（毫秒）
const RATE_LIMIT_COOLDOWN = 30 * 60; // 频率限制后的冷却时间（秒）

export function EmailVerificationBanner() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 处理频率限制
  useEffect(() => {
    // 清理5分钟前的尝试记录
    const now = Date.now();
    const filteredAttempts = attempts.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );

    if (filteredAttempts.length !== attempts.length) {
      setAttempts(filteredAttempts);
    }

    // 检查是否超过频率限制
    if (filteredAttempts.length >= MAX_ATTEMPTS && !isRateLimited) {
      setIsRateLimited(true);
      setCountdown(RATE_LIMIT_COOLDOWN);

      // 设置定时器，在冷却时间结束后重置频率限制
      const rateLimitTimer = setTimeout(() => {
        setIsRateLimited(false);
        setAttempts([]);
      }, RATE_LIMIT_COOLDOWN * 1000);

      return () => clearTimeout(rateLimitTimer);
    }
  }, [attempts, isRateLimited]);

  // 从localStorage加载尝试记录
  useEffect(() => {
    const storedAttempts = localStorage.getItem("emailVerificationAttempts");
    if (storedAttempts) {
      try {
        const parsedAttempts = JSON.parse(storedAttempts);
        setAttempts(parsedAttempts);

        // 检查是否处于冷却状态
        const now = Date.now();
        const recentAttempts = parsedAttempts.filter(
          (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW
        );

        if (recentAttempts.length >= MAX_ATTEMPTS) {
          // 计算剩余冷却时间
          const oldestRecentAttempt = Math.min(...recentAttempts);
          const timeElapsed = (now - oldestRecentAttempt) / 1000;
          const remainingCooldown = Math.max(
            0,
            RATE_LIMIT_COOLDOWN - timeElapsed
          );

          if (remainingCooldown > 0) {
            setIsRateLimited(true);
            setCountdown(Math.ceil(remainingCooldown));
          }
        } else {
          // 检查是否在普通冷却时间内
          const lastAttempt = Math.max(...parsedAttempts, 0);
          const timeSinceLastAttempt = (now - lastAttempt) / 1000;

          if (lastAttempt > 0 && timeSinceLastAttempt < COOLDOWN_TIME) {
            setCountdown(Math.ceil(COOLDOWN_TIME - timeSinceLastAttempt));
          }
        }
      } catch (e) {
        localStorage.removeItem("emailVerificationAttempts");
      }
    }
  }, []);

  // 保存尝试记录到localStorage
  useEffect(() => {
    if (attempts.length > 0) {
      localStorage.setItem(
        "emailVerificationAttempts",
        JSON.stringify(attempts)
      );
    }
  }, [attempts]);

  const handleResendEmail = async () => {
    if (isSending || countdown > 0) return;

    setIsSending(true);
    try {
      await api.users.resendEmail({});

      // 记录此次尝试
      const now = Date.now();
      const newAttempts = [...attempts, now];
      setAttempts(newAttempts);

      // 设置冷却时间
      setCountdown(COOLDOWN_TIME);

      toast({
        title: "发送成功",
        description: "新的验证邮件已发送到您的邮箱",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description:
          error instanceof Error ? error.message : "发送验证邮件失败",
      });
    } finally {
      setIsSending(false);
    }
  };

  // 获取按钮文本
  const getButtonText = () => {
    if (isSending) {
      return "發送中...";
    }

    if (isRateLimited) {
      return `請於 ${Math.floor(countdown / 60)}分${countdown % 60}秒後嘗試`;
    }

    if (countdown > 0) {
      return `重新發送 (${countdown}s)`;
    }

    return "重新發送驗證郵件";
  };

  // 如果用户未登录或邮箱已验证，不显示横幅
  if (!session?.user || session.user.is_email_confirmed !== 0 || !isVisible) {
    return null;
  }

  return (
    <div className="bg-[#FFFCE6] border-y border-[#F8E9A1] py-2 w-full">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm text-[#8B7E2F]">
          <span>
            帳號啟用郵件已發送至{" "}
            <span className="font-medium">{session.user.email}</span>
            ，請啟用帳號，若未收到請檢查垃圾箱。
            <button
              onClick={handleResendEmail}
              disabled={isSending || countdown > 0}
              className={`text-[#8B7E2F] hover:text-[#6B5E1F] font-medium underline underline-offset-2 ${
                isSending || countdown > 0
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {getButtonText()}
            </button>
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[#D6B618] hover:text-[#B69600]"
          aria-label="關閉提醒"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
