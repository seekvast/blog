export * from "./discussion";
export * from "./common";
export * from "./board";
export * from "./user";
export * from "./report";

export interface CreateDiscussionDto {
  title: string;
  content: string;
  board_id: number;
  board_child_id?: number;
  attachments?: string[];
  poll?: string;
}

export interface UpdateDiscussionDto extends Partial<CreateDiscussionDto> {
  slug: string;
}

export interface User {
  id: number;
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
  posts_count: number;
  replies_count: number;
  user_role: number;
}
