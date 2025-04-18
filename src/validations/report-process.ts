import { z } from "zod";

export enum ActionMode {
  REVOKE = 1,
  DELETE = 2,
  BAN = 4,
  MUTE = 5,
  KICK_OUT = 6,
}
export const reportProcessSchema = z.object({
  act_mode: z.nativeEnum(ActionMode),
  act_explain: z
    .string()
    .min(1, "请输入处理原因")
    .max(500, "处理原因不能超过500个字符"),
  reason_desc: z.string().max(500, "处理原因不能超过500个字符"),
  delete_range: z.enum(["none", "1h", "6h", "12h", "24h", "3d", "7d"]),
});

export type ReportProcessSchema = z.infer<typeof reportProcessSchema>;
