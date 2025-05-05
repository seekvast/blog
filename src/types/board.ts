import type { Response, Pagination } from "./common";
import type { User } from "./user";

//看板管理员
interface BoardManager {
  id: number;
  user_hashid: string;
  board_id: number;
  user_role: number;
}

export interface Board {
  id: number;
  name: string;
  avatar: string;
  creator_id: number;
  slug: string;
  desc: string;
  visibility: number;
  badge_visible: number[];
  category_id: number;
  child_id: number;
  is_nsfw: number;
  approval_mode: number;
  question: string;
  answer: string;
  poll_role: number[];
  status: number;
  users_count: number;
  is_joined: number;
  board_user: {
    id: number;
    user_role: number;
    posts_count: number;
    replies_count: number;
    status: number;
  };
  manager: BoardManager;
  category: {
    id: number;
    name: string;
  };
}

export interface BoardChild {
  board_id: number;
  name: string;
  creator_hashid: string;
  is_default: number;
  sort: number;
  id: number;
  is_hidden: number;
  user_hidden: number;
  moderator_only: number;
}

export interface BoardRule {
  id: number;
  title: string;
  content: string;
  sort: number;
}

export interface BoardUser {
  id: number;
  board_id: number;
  user_hashid: string;
  role: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface BoardBlacklist {
  id: number;
  board_id: number;
  user_hashid: string;
  reason: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface BoardHistory {
  id: number;
  board_id: number;
  user_id: number;
  user_hashid: string;
  status: number;
  question: string;
  answer: string;
  user_answer: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export type BoardChildrenResponse = Response<Pagination<BoardChild>>;
