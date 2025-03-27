export * from "./discussion";
export * from "./common";
export * from "./board";
export * from "./user";
export * from "./report";
export * from "./notification";
export * from "./draft";

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
