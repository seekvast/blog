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
}

export interface BoardChildrenResponse {
  code: number;
  data: {
    items: BoardChild[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  }
  message: string;
}
