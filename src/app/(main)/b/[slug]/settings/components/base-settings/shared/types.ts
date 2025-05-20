import { Board, Category } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { boardSchema, BoardFormSchema } from "@/validations/board";

export { boardSchema as formSchema };
export type BoardSettingsFormValues = BoardFormSchema;

export interface BaseSettingsProps {
  board: Board;
  onSuccess?: () => void;
}

export interface SharedSettingsProps {
  form: UseFormReturn<BoardSettingsFormValues>;
  isSubmitting: boolean;
  categories: Category[];
  onSubmit: (values: BoardSettingsFormValues) => Promise<void>;
}
