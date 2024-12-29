export interface Discussion {
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
  votes: number;
  hotness: number;
  main_post: MainPost;
  board: Board;
  board_child: BoardChild;
  user: {
    hashid: string;
    username: string;
    email: string;
    image?: string;
    nickname?: string;
    avatar_url?: string;
    cover?: string;
    bio?: string;
    gender?: number;
    birthday?: string;
    is_email_confirmed?: number;
    joined_at?: string;
    last_seen_at?: string;
  };
}

export interface MainPost {
  id: number;
  board_id: number;
  board_child_id: number;
  number: number;
  parent_id: number;
  depth: number;
  is_private: number;
  is_approved: number;
  user_hashid: string;
  edited_user_hashid: string;
  board_creator_hashid: string;
  type: string;
  content: string;
  edited_at: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Board {
  id: number;
  name: string;
}

export interface BoardChild {
  id: number;
  name: string;
}

export interface DiscussionResponse {
  code: number;
  data: {
    items: Discussion[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  message: string;
}
