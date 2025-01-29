export const ReportTargetType = {
  POST: 1,
  BOARD: 2,
  REPLY: 3,
} as const;

export const ReportTargetTypeMapping = {
  [ReportTargetType.POST]: '帖子',
  [ReportTargetType.BOARD]: '看板',
  [ReportTargetType.REPLY]: '回复',
} as const;

// TypeScript 类型定义
export type ReportTargetTypeValue = typeof ReportTargetType[keyof typeof ReportTargetType]; 