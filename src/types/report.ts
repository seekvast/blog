import { User } from "./user";
import { Discussion, Post } from "./discussion";

export interface Report {
  id: number;
  user_hashid: string;
  target_id: number;
  target_type: string;
  reason: string;
  status: number;
  created_at: string;
  updated_at: string;
  user: User;
  reporter: User;
  discussion: Discussion;
  post: Post;
}

export interface ReportForm {
  user_hashid: string;
  board_id: number;
  discussion_slug?: string;
  post_id?: number;
  reported_to: "admin" | "moderator";
  reason?: number;
  target: number;
}
