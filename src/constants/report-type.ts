export const ReportType = {
  SPAM: 1,
  ABUSE: 2,
  HARASSMENT: 3,
  OTHER: 4,
} as const;

export const ReportTypeMapping = {
  [ReportType.SPAM]: '垃圾广告',
  [ReportType.ABUSE]: '不当内容',
  [ReportType.HARASSMENT]: '骚扰',
  [ReportType.OTHER]: '其他',
} as const;

// TypeScript 类型定义
export type ReportTypeValue = typeof ReportType[keyof typeof ReportType]; 