import { Notification } from "@/types";

/**
 * 解析通知数据字段（从JSON字符串到对象）
 * @param dataStr 通知数据JSON字符串
 * @returns 解析后的对象
 */
export function parseNotificationData(dataStr: string): Record<string, any> {
  try {
    return JSON.parse(dataStr);
  } catch (error) {
    console.error("Failed to parse notification data:", error);
    return {};
  }
}

/**
 * 根据通知类型和数据生成对应的链接
 * @param notification 通知对象
 * @returns 生成的链接
 */
export function getNotificationLink(notification: Notification): string {
  const { type } = notification;
  const data = parseNotificationData(notification.data);

  switch (type) {
    // 文章相关通知
    case "discussionUpVoted":
    case "discussionUpVotedMultiple":
    case "newPost":
    case "followedNewPost":
      return `/d/${notification.subject_slug}`;

    // 回复相关通知
    case "replied":
    case "discussionReplied":
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${data.reply_id || ""}`;

    // 提及通知
    case "userMentioned":
    case "discussionMentioned":
    case "postMentioned":
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${data.post_id || data.reply_id || ""}`;

    // 点赞通知
    case "replyUpVoted":
    case "replyUpVotedMultiple":
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${data.reply_id || ""}`;

    // 内容删除通知
    case "postDeleted":
    case "replyDeleted":
      // 内容已删除，跳转到通知详情页或用户中心
      return "/notifications";

    // 用户处罚通知
    case "userWarned":
    case "userBanned":
    case "userRestricted":
    case "userBannedTemporarily":
      // 跳转到用户设置或帮助页面
      return "/settings/account";

    // 看板管理通知
    case "boardWarned":
    case "boardDeleted":
    case "boardRestricted":
    case "boardConverted":
      return `/b/${notification.subject_slug}`;

    // 年龄验证通知
    case "ageVerified":
    case "ageVerificationFailed":
      return "/settings/account";

    // 看板内容管理通知
    case "boardDeletedPost":
    case "boardDeletedReply":
      return `/b/${notification.subject_slug}`;

    // 看板用户管理通知
    case "boardMutedUser":
    case "boardBannedUser":
    case "boardKickedUser":
      return `/b/${notification.subject_slug}`;

    case "boardChangedUserRole":
      return `/b/${notification.subject_slug}/members`;

    // 看板用户审批通知
    case "boardUserApproved":
      return `/b/${notification.subject_slug}`;

    case "boardUserRoleChanged":
      return `/b/${notification.subject_slug}/members`;

    // 文章状态变更通知
    case "discussionMoved":
    case "discussionLocked":
    case "discussionUnlocked":
    case "discussionStickied":
    case "discussionUnstickied":
      return `/d/${notification.subject_slug}`;

    default:
      // 默认跳转到通知列表页
      return "/notifications";
  }
}
