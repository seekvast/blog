export const AttachmentUsed = {
  NOT_USED: 0,
  USED: 1,
} as const;

export const AttachmentUsedMapping = {
  [AttachmentUsed.NOT_USED]: '未使用',
  [AttachmentUsed.USED]: '已使用',
} as const;

// TypeScript 类型定义
export type AttachmentUsedType = typeof AttachmentUsed[keyof typeof AttachmentUsed]; 