import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { isTaipeiTimezone } from "@/utils/timezone";
import type { Board, Discussion } from "@/types";

// NSFW 提醒冷却时间管理
const NSFW_COOLDOWN_KEY = "nsfw-warning-cooldown";
const NSFW_COOLDOWN_DURATION = 24 * 60 * 60; // 24小时

/**
 * 检查是否应该显示 NSFW 提醒
 * @returns 是否应该显示
 */
function shouldShowNsfwWarning(): boolean {
  if (!isTaipeiTimezone()) return false;

  if (typeof window === "undefined") return false;

  const lastShown = localStorage.getItem(NSFW_COOLDOWN_KEY);
  if (!lastShown) return true;

  const timeSinceLastShown = Date.now() - parseInt(lastShown);
  return timeSinceLastShown >= NSFW_COOLDOWN_DURATION * 1000;
}

/**
 * 设置 NSFW 提醒已显示
 */
function setNsfwWarningShown(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NSFW_COOLDOWN_KEY, Date.now().toString());
}

/**
 * NSFW 提醒 Hook
 * @param board 看板信息（用于 page.tsx）
 * @param discussion 讨论信息（用于 discussion-detail.tsx）
 * @returns NSFW 提醒相关状态和方法
 */
export function useNsfwWarning(board?: Board, discussion?: Discussion) {
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  // 检查是否应该显示 NSFW 提醒
  const shouldShow = React.useMemo(() => {
    // 已登录且年龄认证通过的用户不显示
    if (user && user.age_verified === 1) {
      return false;
    }

    // 检查是否有 NSFW 内容
    const hasNsfwContent =
      board?.is_nsfw === 1 || discussion?.board?.is_nsfw === 1;

    if (!hasNsfwContent) {
      return false;
    }

    // 检查冷却时间和时区
    return shouldShowNsfwWarning();
  }, [user?.age_verified, board?.is_nsfw, discussion?.board?.is_nsfw]);

  // 处理确认
  const handleConfirm = React.useCallback(() => {
    setNsfwWarningShown();
    setShowWarning(false);
  }, []);

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
