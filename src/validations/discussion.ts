import { z } from "zod";

export const discussionQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  board_id: z.string().optional(),
  board_child_id: z.string().optional(),
  type: z.string().optional(),
  keyword: z.string().optional(),
  order: z.enum(["latest", "hottest"]).optional(),
});

// 投票选项验证规则
export const pollOptionSchema = z.string().min(1, "投票选项不能为空");

// 投票验证规则
export const pollSchema = z
  .object({
    options: z
      .array(pollOptionSchema)
      .min(2, "至少需要2个投票选项")
      .max(10, "最多只能有10个投票选项"),
    is_multiple: z.union([z.literal(0), z.literal(1)]),
    show_voter: z.union([z.literal(0), z.literal(1)]),
    is_timed: z.union([z.literal(0), z.literal(1)]),
    end_time: z.string().optional(),
  })
  .refine(
    (data) => {
      // 只有当 is_timed=1 时才验证时间
      if (data.is_timed !== 1) return true;

      // 验证 end_time
      if (data.end_time) {
        const now = new Date();
        const endTime = new Date(data.end_time);
        
        // 结束时间必须在当前时间之后
        if (endTime <= now) {
          return false;
        }
        
        // 结束时间不能超过当前时间后的31天
        const maxEndTime = new Date(now);
        maxEndTime.setDate(maxEndTime.getDate() + 31);
        if (endTime > maxEndTime) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        "投票结束时间必须在当前时间之后，且不能超过当前时间后的31天",
      path: ["is_timed"],
    }
  )
  .refine(
    (data) => {
      // 当 is_timed=1 时，end_time 是必填的
      if (data.is_timed === 1) {
        return !!data.end_time;
      }
      return true;
    },
    {
      message: "当设置了截止时间时，结束时间是必填的",
      path: ["is_timed"],
    }
  );

export const discussionSchema = z.object({
  slug: z.string().optional(),
  title: z
    .string()
    .min(1, "标题不能为空")
    .refine(
      (value) => {
        const chineseChars = value.match(/[\u4e00-\u9fa5]/g) || [];
        const chineseLength = chineseChars.length;

        const otherChars = value.replace(/[\u4e00-\u9fa5]/g, "");
        const otherLength = otherChars.length;

        if (chineseLength > 0 && chineseLength <= 30) {
          return true;
        }
        if (chineseLength === 0 && otherLength <= 60) {
          return true;
        }
        return false;
      },
      {
        message: "标题长度不能超过30个中文字或60个英文字",
      }
    ),
  content: z
    .string()
    .min(1, "内容不能少于1个字符")
    .max(150000, "内容不能超过150,000个字符")
    .refine(
      (content) => {
        const imageMarkdownRegex = /!\[.*?\]\(.*?\)/g;
        const matches = content.match(imageMarkdownRegex) || [];

        return matches.length <= 150;
      },
      {
        message: "文章中的图片数量不能超过150张",
        path: ["content"],
      }
    ),
  board_id: z.number(),
  board_child_id: z.number().optional(),
  type: z.string().optional(),
  is_private: z.boolean().optional(),
  attachments: z
    .array(
      z.object({
        id: z.number(),
        file_name: z.string(),
        file_path: z.string(),
        file_type: z.string(),
      })
    )
    .optional(),
  poll: z.union([pollSchema, z.null()]).optional(),
});

export const updateDiscussionSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(100, "标题不能超过100个字符")
    .optional(),
  content: z.string().min(1, "内容不能为空").optional(),
  board_id: z.number().optional(),
  board_child_id: z.number().optional(),
  type: z.string().optional(),
  is_private: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  is_sticky: z.boolean().optional(),
  attachments: z
    .array(
      z.object({
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number(),
        file_type: z.string(),
      })
    )
    .optional(),
  poll: pollSchema.optional(),
});

// 类型导出
export type PollOption = z.infer<typeof pollOptionSchema>;
export type PollForm = z.infer<typeof pollSchema>;
export type DiscussionQuery = z.infer<typeof discussionQuerySchema>;
export type DiscussionForm = z.infer<typeof discussionSchema>;
export type UpdateDiscussionSchema = z.infer<typeof updateDiscussionSchema>;
