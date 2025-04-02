import { z } from "zod";

export const reportProcessSchema = z.object({
  act_mode: z.enum(["delete", "hide", "lock", "reject"]),
  act_explain: z.string().min(1, "请输入处理原因").max(500, "处理原因不能超过500个字符"),
  reason_desc: z.string().max(500, "处理原因不能超过500个字符"),
  delete_history: z.enum(["none", "1h", "6h", "12h", "24h", "3d", "7d"]),
});

export type ReportProcessSchema = z.infer<typeof reportProcessSchema>;
