import { Notification } from "@/types";

export interface NotificationAvatarInfo {
  href: string;
  avatarUrl: string;
  username: string;
  nickname: string;
  hashid: string;
}

export function getNotificationAvatar(
  notification: Notification
): NotificationAvatarInfo {
  const { type, from_user, data } = notification;

  const defaultInfo: NotificationAvatarInfo = {
    href: `/u/${from_user.username}?hashid=${from_user.hashid}`,
    avatarUrl: from_user.avatar_url || "",
    username: from_user.username,
    nickname: from_user.nickname,
    hashid: from_user.hashid,
  };

  switch (notification.category) {
    case "board_user":
    case "board_manage":
      return {
        href: `/b/${notification.subject_slug}?bid=${data.board_id || ""}`,
        avatarUrl: notification.subject.avatar || "",
        username: notification.subject.name || "board",
        nickname: "board",
        hashid: data.slug || "",
      };
    case "account":
    case "board_violation":
      return {
        href: "/notifications",
        avatarUrl: "/logo.png",
        username: "system",
        nickname: "system",
        hashid: "",
      };
    default:
      return defaultInfo;
  }
}

/**
 * @param notification 通知对象
 * @returns 生成的链接
 */
export function getNotificationLink(notification: Notification): string {
  const { type } = notification;
  const data = notification.data;

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
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${
        data.post_id || ""
      }`;

    // 提及通知
    case "userMentioned":
    case "discussionMentioned":
    case "postMentioned":
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${
        data.post_id || ""
      }`;

    // 点赞通知
    case "replyUpVoted":
    case "replyUpVotedMultiple":
      return `/d/${notification.subject_slug}?page=${data.page || 1}#${
        data.post_id || ""
      }`;

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
      return `/u/${notification.user.username}/settings?hashid=${notification.user.hashid}&violation=account#violation`;

    // 看板管理通知
    case "boardWarned":
    case "boardDeleted":
    case "boardRestricted":
    case "boardConverted":
      return `/b/${notification.subject_slug}?bid=${data.board_id}`;

    // 年龄验证通知
    case "ageVerified":
    case "ageVerificationFailed":
      return `/u/${notification.user.username}/settings?hashid=${notification.user.hashid}#profile`;

    // 看板内容管理通知
    case "boardPostDeleted":
    case "boardReplyDeleted":
    case "boardUserMuted":
    case "boardUserBanned":
    case "boardUserKicked":
      return `/u/${notification.user.username}/settings?hashid=${notification.user.hashid}&violation=board#violation`;
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
    case "boardUserReport":
      return `/b/${notification.subject_slug}/settings?bid=${data.board_id}&tab=reports`;
    case "boardUserSubscribe":
      return `/b/${notification.subject_slug}/settings?bid=${data.board_id}&tab=approval`;
    default:
      // 默认跳转到通知列表页
      return "/notifications";
  }
}
