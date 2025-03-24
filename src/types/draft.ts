import { PollForm, PollOption } from "@/validations/discussion";

export interface Draft {
  user_hashid: string;
  board_id: number;
  board_child_id: number;
  title: string;
  content: string;
  poll?: PollForm | null;
}
