export const ReportReason = {
  SPAM: 1,
  NSFW: 2,
  HARASSMENT: 3,
  INVADE: 4,
  ILLICIT: 5,
  BLOODY: 6,
  HATE: 7,
  DIGRESS: 8,
  VULGAR: 9,
  BREAK: 10,
  ADS: 11,
  OTHER: 12,
} as const;

export const ReportReasonMapping = {
  [ReportReason.SPAM]: '垃圾訊息',
  [ReportReason.NSFW]: '成人內容',
  [ReportReason.HARASSMENT]: '騷擾或霸凌',
  [ReportReason.INVADE]: '侵犯我的權力或隱私權',
  [ReportReason.ILLICIT]: '非法活動或管制物品',
  [ReportReason.BLOODY]: '暴力或露骨',
  [ReportReason.HATE]: '仇恨言論',
  [ReportReason.DIGRESS]: '跑题',
  [ReportReason.VULGAR]: '不雅低俗',
  [ReportReason.BREAK]: '违规',
  [ReportReason.ADS]: '垃圾广告',
  [ReportReason.OTHER]: '其他',
} as const;

// TypeScript 类型定义
export type ReportReasonValue = typeof ReportReason[keyof typeof ReportReason];
