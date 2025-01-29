export const BoardVisibility = {
  PUBLIC: 0,
  PRIVATE: 1,
} as const;

export const BoardVisibilityMapping = {
  [BoardVisibility.PUBLIC]: '公开',
  [BoardVisibility.PRIVATE]: '私密',
} as const;

// TypeScript 类型定义
export type BoardVisibilityType = typeof BoardVisibility[keyof typeof BoardVisibility]; 