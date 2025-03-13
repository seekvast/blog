export interface Report {
  id: number;
  user_hashid: string;
  target_id: number;
  target_type: string;
  reason: string;
  status: number;
  created_at: string;
  updated_at: string;
}
