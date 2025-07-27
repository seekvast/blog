"use client";

import { useState } from "react";
import { Board } from "@/types";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, useToast } from "@/components/ui/use-toast";

export function useBoardActions() {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 加入看板（不需要回答问题）
  const { mutate: subscribeAction } = useMutation({
    mutationFn: (boardId: number) =>
      api.boards.subscribe({ board_id: boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board_detail"] });
      queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: "加入看板失败",
        variant: "destructive",
      });
    },
  });

  const { mutate: blockAction } = useMutation({
    mutationFn: (boardId: number) => api.boards.block({ board_id: boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board_detail"] });
      queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: "拉黑看板失败",
        variant: "destructive",
      });
    },
  });

  // 退出看板
  const { mutate: unsubscribeAction } = useMutation({
    mutationFn: (boardId: number) =>
      api.boards.unsubscribe({ board_id: boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board_detail"] });
      queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: "退出看板失败",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (boardId: number) => {
    subscribeAction(boardId);
  };

  const handleBlock = async (boardId: number) => {
    blockAction(boardId);
  };

  const handleUnsubscribe = async (boardId: number, onSuccess?: () => void) => {
    unsubscribeAction(boardId, {
      onSuccess: () => {
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ["boards"] });
        queryClient.invalidateQueries({ queryKey: ["board_detail"] });
        queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
      },
    });
  };

  const handleReport = () => {
    setReportDialogOpen(true);
  };

  // 加入看板（需要回答问题）
  const { mutate: subscribeWithAnswer, isPending: isSubscribing } = useMutation(
    {
      mutationFn: ({ boardId, answer }: { boardId: number; answer: string }) =>
        api.boards.subscribe({
          board_id: boardId,
          answer: answer.trim(),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["boards"] });
        queryClient.invalidateQueries({ queryKey: ["board_detail"] });
        queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
      },
      onError: (error) => {
        toast({
          title: "错误",
          description: error instanceof Error ? error.message : "加入看板失败",
          variant: "destructive",
        });
      },
    }
  );

  return {
    reportDialogOpen,
    setReportDialogOpen,
    handleSubscribe,
    handleBlock,
    handleUnsubscribe,
    handleReport,
    subscribeWithAnswer,
    isSubscribing,
  };
}
