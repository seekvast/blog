import type { Board, BoardChild, User } from "@/types";
import type { Response, Pagination } from "./common";

export interface DiscussionUser {
  id: number;
  subscription: string;
  is_bookmarked: string;
}

export interface PostVote {
  id: number;
  post_id: number;
  vote: string;
}

export interface Discussion {
  id: number;
  title: string;
  comment_count: number;
  participant_count: number;
  post_number_index: number;
  user_hashid: string;
  first_post_id: number;
  last_posted_at: string;
  last_posted_user_hashid: string;
  last_post_id: number;
  last_post_number: number;
  board_id: number;
  board_child_id: number;
  board_creator_hashid: string;
  hidden_at: string | null;
  hidden_user_hashid: string;
  slug: string;
  diff_humans: string;
  is_private: number;
  is_approved: number;
  is_locked: number;
  is_sticky: number;
  view_count: number;
  up_votes: number;
  down_votes: number;
  hotness: number;
  is_voted: boolean;
  votes_count: number;
  main_post: Post;
  board: Board;
  board_child: BoardChild;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
  discussion_user: DiscussionUser;
  user_voted: PostVote;
}

export interface Post {
  id: number;
  board_id: number;
  board_child_id: number;
  number: number;
  parent_id: number;
  depth: number;
  is_private: number;
  is_approved: number;
  up_votes_count: number;
  down_votes_count: number;
  user_hashid: string;
  edited_user_hashid: string;
  board_creator_hashid: string;
  type: string;
  content: string;
  discussion_slug: string;
  edited_at: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent_post: Post;
  user: User;
  user_voted: PostVote | null;
}

export type DiscussionResponse = Response<Pagination<Discussion>>;
