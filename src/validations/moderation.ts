import { z } from "zod";

export enum ActionMode {
  REVOKE = 1,
  DELETE = 2,
  BAN = 4,
  MUTE = 5,
  KICK_OUT = 6,
}
export const moderationProcessSchema = z
  .object({
    act_mode: z.nativeEnum(ActionMode),
    mute_days: z
      .number()
      .min(1, "禁言天数最少为1天")
      .max(31, "禁言天数最多为31天")
      .optional(),
    act_explain: z.string().max(500, "处理原因不能超过500个字符").optional(),
    reason_desc: z.string().max(500, "处理原因不能超过500个字符").optional(),
    delete_range: z.enum(["none", "1h", "6h", "12h", "24h", "3d", "7d"]),
  })
  .refine(
    (data) => {
      // 如果选择了禁言模式，则必须提供禁言天数
      if (data.act_mode === ActionMode.MUTE && !data.mute_days) {
        return false;
      }
      return true;
    },
    {
      message: "请输入禁言天数",
      path: ["mute_days"],
    }
  );

export type ModerationProcessSchema = z.infer<typeof moderationProcessSchema>;
