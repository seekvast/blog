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
