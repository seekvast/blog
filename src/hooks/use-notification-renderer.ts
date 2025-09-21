"use client";

import { useTranslation } from "react-i18next";
import { Notification } from "@/types/notification";

export function useNotificationRenderer() {
  const { t } = useTranslation('notification');

  const simpleCategorys = ["board_violation", "account", "board_user"];

  const renderTitle = (notification: Notification, simple: boolean = true): string => {
    const { category, type, data } = notification;
    if (simple && simpleCategorys.includes(category)) {
      return t(`${type}.simple.title`);
    }
    const translationKey = `${type}.title`;
    return (t(translationKey, { ...data }) as string) || `[${type}]`;
  };

  const renderContent = (notification: Notification, simple: boolean = true): string => {
    const { category, type, data } = notification;
    if (simple && simpleCategorys.includes(category)) {
      return t(`${type}.simple.content`, {...data}) as string;
    }
    const translationKey = `${type}.content`;

    return (t(translationKey, { ...data }) as string) || "";
  };

  const renderMeta = (notification: Notification, simple: boolean = true): string => {
    const { type, data } = notification;

    const metaTranslationKey = `${type}.meta.reason`;
    return (t(metaTranslationKey, { ...data }) as string) || "";
  };

  return {
    renderTitle,
    renderContent,
    renderMeta,
    isTemplatesLoaded: true,
  };
}
