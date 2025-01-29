export const ReportActMode = {
  DELETE: 1,
  HIDE: 2,
  WARN: 3,
} as const;

export const ReportActModeMapping = {
  [ReportActMode.DELETE]: '删除',
  [ReportActMode.HIDE]: '隐藏',
  [ReportActMode.WARN]: '警告',
} as const;

// TypeScript 类型定义
export type ReportActModeType = typeof ReportActMode[keyof typeof ReportActMode]; 