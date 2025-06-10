"use client";

import { useState } from "react";
import { Board } from "@/types";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useBoardActions() {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // 加入看板
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
    mutationFn: (boardId: number) => api.boards.unsubscribe({ board_id: boardId }),
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

  const handleUnsubscribe = async (boardId: number) => {
    unsubscribeAction(boardId);
  };

  const handleReport = () => {
    setReportDialogOpen(true);
  };

  return {
    reportDialogOpen,
    setReportDialogOpen,
    handleSubscribe,
    handleBlock,
    handleUnsubscribe,
    handleReport,
  };
}
