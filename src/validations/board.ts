import { z } from "zod";
export const boardSchema = z.object({
  name: z
    .string()
    .min(1, { message: "看板名称不能为空" })
    .max(15, { message: "看板名称最长15个字符" }),
  
  slug: z
    .string()
    .min(1, { message: "看板网址不能为空" })
    .min(7, { message: "看板网址最少7个字符" })
    .max(25, { message: "看板网址最长25个字符" })
    .regex(/^[a-zA-Z0-9_-]+$/, { 
      message: "看板网址只能包含英文字母、数字、下划线和连字符，长度在7-25之间" 
    }),
  
  desc: z
    .string()
    .max(500, { message: "看板简介最长500个字符" })
    .optional()
    .nullable(),
  
  question: z
    .string()
    .max(100, { message: "问题最长100个字符" })
    .optional()
    .nullable(),
  
  answer: z
    .string()
    .max(100, { message: "答案最长100个字符" })
    .optional()
    .nullable(),
  
  visibility: z.number(),
  category_id: z.number().optional(),
  is_nsfw: z.number(),
  attachment_id: z.number().optional(),
  avatar: z.string().max(500).optional(),
  
  // 从 types.ts 添加的额外字段
  badge_visible: z.array(z.number()),
  poll_role: z.array(z.number()),
  approval_mode: z.number(),
});

export type BoardFormSchema = z.infer<typeof boardSchema>;
