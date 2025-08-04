import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { isTaipeiTimezone } from "@/utils/timezone";
import { usePathname } from "next/navigation";

const NSFW_COOLDOWN_KEY = "nsfw-warning-cooldown";
const NSFW_COOLDOWN_DURATION = 24 * 60 * 60; // 24小时

/**
 * @param userHashid 用户 hashid
 * @returns 冷却时间键名
 */
function getCooldownKey(userHashid?: string): string {
  if (userHashid) {
    return `${NSFW_COOLDOWN_KEY}-${userHashid}`;
  }
  return NSFW_COOLDOWN_KEY;
}

/**
 * @param userHashid 用户 hashid
 * @returns 是否应该显示
 */
function shouldShowNsfwWarning(userHashid?: string): boolean {
  if (!isTaipeiTimezone()) return false;

  if (typeof window === "undefined") return false;

  const cooldownKey = getCooldownKey(userHashid);
  const lastShown = localStorage.getItem(cooldownKey);
  if (!lastShown) return true;

  const timeSinceLastShown = Date.now() - parseInt(lastShown);
  return timeSinceLastShown >= NSFW_COOLDOWN_DURATION * 1000;
}

/**
 * @param userHashid 用户 hashid
 */
function setNsfwWarningShown(userHashid?: string): void {
  if (typeof window === "undefined") return;

  try {
    const cooldownKey = getCooldownKey(userHashid);
    const timestamp = Date.now().toString();
    localStorage.setItem(cooldownKey, timestamp);
  } catch (error) {
    console.error(`[NSFW Warning] Error saving cooldown:`, error);
  }
}

/**
 * @returns NSFW 提醒相关状态和方法
 */
export function useNsfwWarning() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);

  // 检查是否应该显示 NSFW 提醒
  const shouldShow = React.useMemo(() => {
    // 首页不显示警告
    if (pathname === "/") {
      return false;
    }

    // 已登录且年龄认证通过的用户不显示
    if (user && user.age_verified === 1) {
      return false;
    }

    // 检查冷却时间和时区
    return shouldShowNsfwWarning(user?.hashid);
  }, [user?.age_verified, user?.hashid, pathname]);

  // 处理确认
  const handleConfirm = React.useCallback(() => {
    setNsfwWarningShown(user?.hashid);
    setShowWarning(false);
  }, [user?.hashid]);

  // 处理取消
  const handleCancel = React.useCallback(() => {
    setShowWarning(false);
  }, []);

  // 检查并设置警告状态
  useEffect(() => {
    if (shouldShow) {
      setShowWarning(true);
    }
  }, [shouldShow]);

  return {
    showWarning,
    setShowWarning,
    handleConfirm,
    handleCancel,
    shouldShow,
  };
}
