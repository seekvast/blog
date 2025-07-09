"use client";

import { useTranslation } from "react-i18next";
import { OperationLog, OperationLogData } from "@/types/operation-log";
import {
  getOperationTypeCategory,
  getOperationLogTranslationKey,
} from "@/constants/operation-log";

export function useOperationLogRenderer() {
  const { t } = useTranslation();

  const renderDescription = (operationLog: OperationLog): string => {
    const { action, category, ext, operator_user, user, data } = operationLog;

    // 准备占位符数据
    const safeData = data || {};
    const placeholders: OperationLogData = {
      operator_name:
        operator_user?.nickname || operator_user?.username || "system",
      username: user?.nickname || "",
      title: safeData.title || "",
      old_value: safeData.old_value || "",
      new_value: safeData.new_value || "",
      name: safeData.name || "",
      days: safeData.days != null ? Number(safeData.days) || 0 : 0,
      reason: safeData.reason || "",
      status: safeData.status || 0,
      is_default: safeData.is_default || 0,
      is_hidden: safeData.is_hidden || 0,
      moderator_only: safeData.moderator_only || 0,
    };

    const translationKey = getOperationLogTranslationKey(category, action);
    const template = t(translationKey, placeholders) as string;

    if (template && template !== translationKey) {
      return template;
    }

    // 如果没有找到翻译，使用默认模板
    return t("operationLogs.default_log", {
      operator_name: placeholders.operator_name,
      action_code: action,
      details: JSON.stringify(data || {}),
    }) as string;
  };

  const renderSimpleDescription = (operationLog: OperationLog): string => {
    const { action, category, data, operator_user, user } = operationLog;

    // 对于简单描述，我们可以使用更简洁的格式
    const safeData = data || {};
    const placeholders: OperationLogData = {
      operator_name:
        operator_user?.nickname || operator_user?.username || "system",
      username: user?.nickname || "",
      title: safeData.title || "",
      old_value: safeData.old_value || "",
      new_value: safeData.new_value || "",
      name: safeData.name || "",
      days: safeData.days != null ? Number(safeData.days) || 0 : 0,
      reason: safeData.reason || "",
      status: safeData.status || 0,
      is_default: safeData.is_default || 0,
      is_hidden: safeData.is_hidden || 0,
      moderator_only: safeData.moderator_only || 0,
    };

    // 根据操作类型返回简化的描述
    switch (action) {
      case "delete":
        if (category === "post") {
          return `${placeholders.operator_name} 删除了 ${placeholders.username} 的回帖`;
        } else if (category === "discussion") {
          return `${placeholders.operator_name} 删除了 ${placeholders.username} 的帖子`;
        } else if (category === "user") {
          return `${placeholders.operator_name} 删除了 ${placeholders.username} 的账号`;
        } else if (category === "board") {
          return `${placeholders.operator_name} 删除了看板`;
        } else if (category === "board_child") {
          return `${placeholders.operator_name} 删除了子版`;
        } else if (category === "board_rule") {
          return `${placeholders.operator_name} 删除了规则`;
        }
        break;
      case "mute":
        return `${placeholders.operator_name} 禁言了 ${placeholders.username}`;
      case "ban":
        return `${placeholders.operator_name} 封禁了 ${placeholders.username}`;
      case "kick":
        return `${placeholders.operator_name} 踢出了 ${placeholders.username}`;
      case "role":
        return `${placeholders.operator_name} 变更了 ${placeholders.username} 的身份组`;
      case "create":
        if (category === "board") {
          return `${placeholders.operator_name} 创建了看板`;
        } else if (category === "board_child") {
          return `${placeholders.operator_name} 创建了子版`;
        } else if (category === "board_rule") {
          return `${placeholders.operator_name} 创建了规则`;
        } else if (category === "discussion") {
          return `${placeholders.operator_name} 创建了文章`;
        } else if (category === "post") {
          return `${placeholders.operator_name} 创建了回帖`;
        }
        break;
      default:
        return `${placeholders.operator_name} 执行了操作`;
    }

    return `${placeholders.operator_name} 执行了操作`;
  };

  const getOperationType = (operationLog: OperationLog): string => {
    const { category } = operationLog;
    return getOperationTypeCategory(category);
  };

  const getOperationIcon = (operationLog: OperationLog): string => {
    const { action, category } = operationLog;

    // 根据操作类型和分类返回图标类名
    switch (action) {
      case "delete":
        if (category === "post" || category === "discussion") {
          return "trash";
        } else if (category === "board" || category === "board_child") {
          return "trash-2";
        } else if (category === "board_rule") {
          return "file-x";
        } else if (category === "user") {
          return "user-x";
        }
        return "trash";
      case "create":
        if (category === "board") {
          return "plus-circle";
        } else if (category === "board_rule") {
          return "file-text";
        }
        return "plus";
      case "mute":
        return "volume-x";
      case "ban":
        return "user-x";
      case "kick":
        return "log-out";
      case "role":
        return "users";
      case "age_verify":
        return "shield-check";
      case "warn":
        return "alert-triangle";
      case "restrict":
        return "lock";
      case "approve":
        return "check-circle";
      case "update":
        return "edit";
      case "rename":
        return "type";
      case "update_default":
        return "star";
      case "update_moderator_only":
        return "shield";
      case "update_hidden":
        return "eye-off";
      default:
        return "activity";
    }
  };

  return {
    renderDescription,
    renderSimpleDescription,
    getOperationType,
    getOperationIcon,
    isTemplatesLoaded: true,
  };
}
