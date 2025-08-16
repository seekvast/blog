export const BoardUserStatus = {
  PENDING: 0,
  PASS: 1,
  REJECT: 2,
  BAN: 4,
  MUTE: 5,
  KICK_OUT: 6,
  LEAVE: 7,
} as const;

export const BoardUserStatusMapping = {
  [BoardUserStatus.PASS]: "正常",
  [BoardUserStatus.REJECT]: "拒绝",
  [BoardUserStatus.PENDING]: "审核中",
  [BoardUserStatus.BAN]: "封锁",
  [BoardUserStatus.MUTE]: "禁言",
  [BoardUserStatus.KICK_OUT]: "踢出",
  [BoardUserStatus.LEAVE]: "退出",
} as const;

// TypeScript 类型定义
export type BoardUserStatusType =
  (typeof BoardUserStatus)[keyof typeof BoardUserStatus];
