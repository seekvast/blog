import { Board, Category } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "看板名称不能为空"),
  slug: z
    .string()
    .min(7)
    .max(25)
    .regex(/^[a-zA-Z0-9]+$/, "只能输入英文和数字"),
  desc: z.string().max(500, "看板描述不能超过500字"),
  badge_visible: z.array(z.number()),
  is_nsfw: z.number(),
  visibility: z.number(),
  poll_role: z.array(z.number()),
  approval_mode: z.number(),
  question: z.string().optional(),
  answer: z.string().optional(),
  category_id: z.number().optional(),
  avatar: z.string().max(500).optional(),
});

export type FormData = z.infer<typeof formSchema>;

export interface BaseSettingsProps {
  board: Board;
  onSuccess?: () => void;
}

export type BoardSettingsFormValues = FormData;

export interface SharedSettingsProps {
  form: UseFormReturn<BoardSettingsFormValues>;
  isSubmitting: boolean;
  boardAvatar: string | null;
  categories: Category[];
  onSubmit: (values: BoardSettingsFormValues) => Promise<void>;
}
