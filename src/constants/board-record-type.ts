export const BoardRecordType = {
  JOIN: 1,
  EDIT: 2,
} as const;

export const BoardRecordTypeMapping = {
  [BoardRecordType.JOIN]: '加入',
  [BoardRecordType.EDIT]: '编辑',
} as const;

// TypeScript 类型定义
export type BoardRecordTypeValue = typeof BoardRecordType[keyof typeof BoardRecordType]; 