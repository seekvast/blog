export const PostType = {
  COMMENT: 'comment',
  BOARD_STICKIED: 'discussionBoardStickied',
  LOCKED: 'discussionLocked',
  RENAMED: 'discussionRenamed',
  STICKIED: 'discussionStickied',
  TAGGED: 'discussionTagged',
} as const;

export const PostTypeMapping = {
  [PostType.COMMENT]: '评论',
  [PostType.BOARD_STICKIED]: '讨论板置顶',
  [PostType.LOCKED]: '讨论锁定',
  [PostType.RENAMED]: '讨论重命名',
  [PostType.STICKIED]: '讨论置顶',
  [PostType.TAGGED]: '讨论标签',
} as const;

// TypeScript 类型定义
export type PostTypeValue = typeof PostType[keyof typeof PostType]; 