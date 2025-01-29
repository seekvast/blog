export const AttachmentType = {
  TOPIC: 'topics_images',
  USER_AVATAR: 'profile_avatars',
  USER_PROFILE: 'profile_covers',
  BOARD_AVATAR: 'board_avatars',
} as const;

export const AttachmentTypeMapping = {
  [AttachmentType.TOPIC]: 'topics_images',
  [AttachmentType.USER_AVATAR]: 'profile_avatars',
  [AttachmentType.USER_PROFILE]: 'profile_covers',
  [AttachmentType.BOARD_AVATAR]: 'board_avatars',
} as const;

// TypeScript 类型定义
export type AttachmentTypeValue = typeof AttachmentType[keyof typeof AttachmentType]; 