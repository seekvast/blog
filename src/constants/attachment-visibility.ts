export const AttachmentVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

// 对应PHP中的mapping数组
export const AttachmentVisibilityList = [
  AttachmentVisibility.PUBLIC,
  AttachmentVisibility.PRIVATE,
] as const;

// TypeScript 类型定义
export type AttachmentVisibilityType = typeof AttachmentVisibility[keyof typeof AttachmentVisibility]; 