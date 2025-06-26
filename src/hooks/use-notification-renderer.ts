"use client";

import { useTranslation } from "react-i18next";
import { Notification } from "@/types/notification";

export function useNotificationRenderer() {
  const { t } = useTranslation();

  const simpleCategorys = ["board_violation", "account", "board_user"];

  const renderTitle = (notification: Notification, simple: boolean = true): string => {
    const { category, type, data } = notification;
    if (simple && simpleCategorys.includes(category)) {
      return t(`notifications.${type}.simple.title`);
    }
    const translationKey = `notifications.${type}.title`;
    return (t(translationKey, { ...data }) as string) || `[${type}]`;
  };

  const renderContent = (notification: Notification, simple: boolean = true): string => {
    const { category, type, data } = notification;
    if (simple && simpleCategorys.includes(category)) {
      return t(`notifications.${type}.simple.content`, {...data}) as string;
    }
    const translationKey = `notifications.${type}.content`;

    return (t(translationKey, { ...data }) as string) || "";
  };

  const renderMeta = (notification: Notification, simple: boolean = true): string => {
    const { type, data } = notification;

    const metaTranslationKey = `notifications.${type}.meta.reason`;
    return (t(metaTranslationKey, { ...data }) as string) || "";
  };

  return {
    renderTitle,
    renderContent,
    renderMeta,
    isTemplatesLoaded: true,
  };
}
