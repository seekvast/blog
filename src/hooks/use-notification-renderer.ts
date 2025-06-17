"use client";

import { useTranslation } from "react-i18next";
import { Notification } from "@/types/notification";

export function useNotificationRenderer() {
  const { t } = useTranslation();

  const renderTitle = (notification: Notification): string => {
    const { type, data } = notification;
    
    // 直接使用约定的翻译键，无需后端模板
    const translationKey = `notifications.${type}.title`;
    return t(translationKey, data) || `[${type}]`;
  };

  const renderContent = (notification: Notification): string => {
    const { type, data } = notification;
    
    // 直接使用约定的翻译键，无需后端模板
    const translationKey = `notifications.${type}.content`;
    return t(translationKey, data) || '';
  };

  const renderMeta = (notification: Notification): string => {
    const { type, data } = notification;
    
    // 对于有 meta 字段的通知类型，渲染 meta 信息
    const metaTranslationKey = `notifications.${type}.meta.reason`;
    return t(metaTranslationKey, data) || '';
  };

  return {
    renderTitle,
    renderContent,
    renderMeta,
    // 始终为 true，因为不依赖外部模板加载
    isTemplatesLoaded: true
  };
}
