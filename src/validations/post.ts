import { z } from "zod";

// 解析 Markdown 内容中的图片数量
const countImagesInMarkdown = (content: string): number => {
  // 匹配 Markdown 图片格式 ![alt](url)
  const imageRegex = /!\[.*?\]\(.*?\)/g;
  const matches = content.match(imageRegex);
  return matches ? matches.length : 0;
};

export const postQuerySchema = z.object({
  discussion_id: z.string(),
  page: z.string().optional(),
  per_page: z.string().optional(),
  parent_id: z.string().optional(),
});

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "评论内容不能为空")
    .max(20000, "评论内容不能超过20,000字")
    .refine(
      (content) => countImagesInMarkdown(content) <= 25,
      {
        message: "最多只能上传25张图片"
      }
    ),
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
