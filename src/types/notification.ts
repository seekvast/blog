import { Discussion } from "./discussion";
import { User } from "./user";

export interface Notification {
    id: number;
    subject_id: number;
    subject_slug: string;
    type: string;
    data: string;
    discussion: Discussion;
    user: User;
    from_user: User;
    read_at: string | null;
    created_at: string;
    updated_at: string;
  }