import { api } from "@/lib/api";

export interface CreateReportParams {
  user_hashid: string;
  board_id: number;
  discussion_slug?: string;
  post_id?: number;
  reported_to: "admin" | "moderator";
  reason: number;
  target: number;
  act_mode: number;
}

export const reportService = {
  create: async (params: CreateReportParams) => {
    const response = await api.post("/api/reports/create", params);
    return response.data;
  },
};
