export const UserGender = {
  MALE: 1,
  FEMALE: 2,
  OTHER: 0,
} as const;

export const UserGenderMapping = {
  [UserGender.MALE]: '男',
  [UserGender.FEMALE]: '女',
  [UserGender.OTHER]: '其他',
} as const;

// TypeScript 类型定义
export type UserGenderType = typeof UserGender[keyof typeof UserGender]; 