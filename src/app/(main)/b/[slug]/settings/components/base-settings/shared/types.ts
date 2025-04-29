import { Board, Category } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { boardSchema, BoardFormSchema } from "@/validations/board";

export { boardSchema as formSchema };
export type FormData = BoardFormSchema;

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
