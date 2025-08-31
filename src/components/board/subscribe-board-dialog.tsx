import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface SubscribeBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  question: string;
  onSuccess?: () => void;
}

export function SubscribeBoardDialog({
  open,
  onOpenChange,
  boardId,
  question,
  onSuccess,
}: SubscribeBoardDialogProps) {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        variant: "default",
        title: "请输入答案",
      });
      return;
    }

    try {
      setIsLoading(true);
      await api.boards.subscribe({
        board_id: boardId,
        answer: answer.trim(),
      });

      toast({
        description: "等待管理员审核",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "default",
        title: "加入失败",
        description:
          error instanceof Error ? error.message : "加入失败，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>回答加入看板问题</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">{question}？</div>
          <Input
            placeholder="请输入答案"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            提交
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
