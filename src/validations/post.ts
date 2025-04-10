import { z } from "zod";

export const postQuerySchema = z.object({
  discussion_id: z.string(),
  page: z.string().optional(),
  per_page: z.string().optional(),
  parent_id: z.string().optional(),
});

export const postSchema = z.object({
  content: z.string().min(1, "评论内容不能为空"),
  slug: z.string(),
  parent_id: z.number().optional(),
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
});

export type PostQuery = z.infer<typeof postQuerySchema>;
export type PostForm = z.infer<typeof postSchema>;
