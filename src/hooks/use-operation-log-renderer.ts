"use client";

import { useTranslation } from "react-i18next";
import { OperationLog, OperationLogData } from "@/types/operation-log";
import { getOperationLogTranslationKey } from "@/constants/operation-log";

export function useOperationLogRenderer() {
  const { t } = useTranslation();

  // 转换布尔值为中文描述
  const convertBooleanValues = (
    placeholders: OperationLogData
  ): OperationLogData => {
    const converted = { ...placeholders };

    // 处理 is_default
    if ("is_default" in placeholders) {
      converted.is_default = placeholders.is_default
        ? "默认分类"
        : "非默认分类";
    }

    // 处理 is_hidden
    if ("is_hidden" in placeholders) {
      converted.is_hidden = placeholders.is_hidden ? "隐藏分类" : "显示分类";
    }

    // 处理 moderator_only
    if ("moderator_only" in placeholders) {
      converted.moderator_only = placeholders.moderator_only
        ? "仅管理员可发帖"
        : "所有人可发帖";
    }

    return converted;
  };

  // 渲染标题（简短描述）
  const renderTitle = (operationLog: OperationLog): string => {
    const { action, category, operator_user, user, data } = operationLog;

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

    // 转换布尔值
    const convertedPlaceholders = convertBooleanValues(placeholders);

    const translationKey = getOperationLogTranslationKey(category, action);

    // 尝试获取新的对象结构
    const translationObject = t(translationKey, {
      returnObjects: true,
      ...convertedPlaceholders,
    });

    if (
      translationObject &&
      typeof translationObject === "object" &&
      "title" in translationObject
    ) {
      // 新的对象结构
      return t(`${translationKey}.title`, convertedPlaceholders) as string;
    } else {
      // 向后兼容：旧的字符串结构
      const template = t(translationKey, convertedPlaceholders) as string;
      if (template && template !== translationKey) {
        return template;
      }
    }

    // 如果没有找到翻译，使用默认模板
    const defaultTemplate = t("operationLogs.default_log", {
      returnObjects: true,
      ...convertedPlaceholders,
    });
    if (
      defaultTemplate &&
      typeof defaultTemplate === "object" &&
      "title" in defaultTemplate
    ) {
      return t(
        "operationLogs.default_log.title",
        convertedPlaceholders
      ) as string;
    } else {
      return t("operationLogs.default_log", convertedPlaceholders) as string;
    }
  };

  // 渲染详细内容
  const renderContent = (operationLog: OperationLog): string => {
    const { action, category, operator_user, user, data } = operationLog;

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

    // 转换布尔值
    const convertedPlaceholders = convertBooleanValues(placeholders);

    const translationKey = getOperationLogTranslationKey(category, action);

    // 尝试获取新的对象结构的content
    const translationObject = t(translationKey, {
      returnObjects: true,
      ...convertedPlaceholders,
    });

    if (
      translationObject &&
      typeof translationObject === "object" &&
      "content" in translationObject
    ) {
      return t(`${translationKey}.content`, convertedPlaceholders) as string;
    }

    // 如果没有content字段，返回空字符串或默认内容
    const defaultTemplate = t("operationLogs.default_log", {
      returnObjects: true,
      ...convertedPlaceholders,
    });
    if (
      defaultTemplate &&
      typeof defaultTemplate === "object" &&
      "content" in defaultTemplate
    ) {
      return t(
        "operationLogs.default_log.content",
        convertedPlaceholders
      ) as string;
    }

    return "";
  };

  // 保持向后兼容的renderDescription方法
  const renderDescription = (operationLog: OperationLog): string => {
    return renderTitle(operationLog);
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
    return category;
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
    renderTitle,
    renderContent,
    renderDescription,
    renderSimpleDescription,
    getOperationType,
    getOperationIcon,
    isTemplatesLoaded: true,
  };
}
