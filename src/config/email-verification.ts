/**
 * 邮箱验证相关配置
 */

// 邮箱未验证时仍可访问的路由（白名单）
export const EMAIL_VERIFICATION_WHITELIST_ROUTES = [
  // 用户设置相关（允许修改密码和邮箱）
  "/u/[id]/settings",
  "/u/[id]/settings/security",

  // 邮箱验证相关页面
  "/email/confirm",
  "/email/reset",
  "/email/verify",

  // 密码重置相关
  "/forgot-password",
  "/reset-password",

  // 基础页面（只读）
  "/",
  "/explore",
  "/b/[id]", // 可以查看看板但不能互动
  "/d/[id]", // 可以查看讨论但不能互动
  "/u/[id]", // 可以查看用户资料

  // 认证相关
  "/login",
  "/register",
  "/logout",

  // 静态页面
  "/about",
  "/privacy",
  "/terms",
  "/help",
] as const;

// 需要邮箱验证的功能类型
export enum EmailVerificationRequiredFeature {
  DEFAULT = "default",
  // 内容创建
  CREATE_POST = "create_post",
  CREATE_DISCUSSION = "create_discussion",
  CREATE_BOARD = "create_board",

  // 互动功能
  REPLY = "reply",
  COMMENT = "comment",
  VOTE = "vote",
  LIKE = "like",
  BLOCK = "block",

  // 社交功能
  FOLLOW_USER = "follow_user",
  FOLLOW_BOARD = "follow_board",
  SUBSCRIBE = "subscribe",

  // 管理功能
  REPORT = "report",
  MODERATE = "moderate",

  // 其他互动
  BOOKMARK = "bookmark",
  SHARE = "share",
}

// 受限功能的配置
export const EMAIL_VERIFICATION_RESTRICTED_FEATURES = {
  [EmailVerificationRequiredFeature.DEFAULT]: {
    message: "此功能需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.CREATE_POST]: {
    message: "发布文章需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.CREATE_DISCUSSION]: {
    message: "创建讨论需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.CREATE_BOARD]: {
    message: "创建看板需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.REPLY]: {
    message: "回复需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.COMMENT]: {
    message: "评论需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.VOTE]: {
    message: "投票需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.LIKE]: {
    message: "点赞需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.FOLLOW_USER]: {
    message: "关注用户需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.FOLLOW_BOARD]: {
    message: "关注看板需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.SUBSCRIBE]: {
    message: "订阅需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.REPORT]: {
    message: "举报需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.MODERATE]: {
    message: "管理功能需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.BOOKMARK]: {
    message: "收藏需要验证邮箱",
    redirectTo: "/email/verify",
  },
  [EmailVerificationRequiredFeature.SHARE]: {
    message: "分享需要验证邮箱",
    redirectTo: "/email/verify",
  },
} as const;

// 检查路由是否在白名单中
export function isRouteWhitelisted(pathname: string): boolean {
  return EMAIL_VERIFICATION_WHITELIST_ROUTES.some((route) => {
    // 处理动态路由
    const pattern = route.replace(/\[id\]/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

// 检查路由是否需要邮箱验证
export function isEmailVerificationRequired(pathname: string): boolean {
  // 如果在白名单中，则不需要验证
  if (isRouteWhitelisted(pathname)) {
    return false;
  }

  // 其他所有需要登录的路由都需要邮箱验证
  return true;
}

// 获取功能限制配置
export function getFeatureRestriction(
  feature: EmailVerificationRequiredFeature
) {
  return EMAIL_VERIFICATION_RESTRICTED_FEATURES[feature];
}
