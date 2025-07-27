"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type MutateOptions = {
  onSuccess?: (...args: any[]) => void;
  onError?: (...args: any[]) => void;
};

export function useBoardActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateBoardQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["boards"] });
    queryClient.invalidateQueries({ queryKey: ["board_detail"] });
    queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
  };

  const commonOnError = (error: unknown) => {
    toast({
      title: "操作失败",
      description: error instanceof Error ? error.message : "出现未知错误",
      variant: "destructive",
    });
  };

  const { mutate: subscribeAction, isPending: isSubscribingWithoutAnswer } =
    useMutation({
      mutationFn: (boardId: number) =>
        api.boards.subscribe({ board_id: boardId }),
      onError: commonOnError,
    });

  const { mutate: blockAction, isPending: isBlocking } = useMutation({
    mutationFn: (params: { board_id: number; quit?: boolean }) =>
      api.boards.block(params),
    onError: commonOnError,
  });

  const { mutate: unsubscribeAction, isPending: isUnsubscribing } = useMutation(
    {
      mutationFn: (boardId: number) =>
        api.boards.unsubscribe({ board_id: boardId }),
      onError: commonOnError,
    }
  );

  const {
    mutate: subscribeWithAnswerAction,
    isPending: isSubscribingWithAnswer,
  } = useMutation({
    mutationFn: ({ boardId, answer }: { boardId: number; answer: string }) =>
      api.boards.subscribe({
        board_id: boardId,
        answer: answer.trim(),
      }),
    onError: commonOnError,
  });

  const handleSubscribe = (boardId: number, options?: MutateOptions) => {
    subscribeAction(boardId, {
      onSuccess: () => {
        invalidateBoardQueries();
        options?.onSuccess?.();
      },
    });
  };

  const handleBlock = (
    boardId: number,
    quit?: boolean,
    options?: MutateOptions
  ) => {
    blockAction(
      { board_id: boardId, quit },
      {
        onSuccess: () => {
          invalidateBoardQueries();
          options?.onSuccess?.();
        },
      }
    );
  };

  const handleUnsubscribe = (boardId: number, options?: MutateOptions) => {
    unsubscribeAction(boardId, {
      onSuccess: () => {
        invalidateBoardQueries();
        options?.onSuccess?.();
      },
    });
  };

  const cancelSubscriptionRequest = (
    boardId: number,
    options?: MutateOptions
  ) => {
    unsubscribeAction(boardId, {
      onSuccess: () => {
        invalidateBoardQueries();
        options?.onSuccess?.();
      },
    });
  };

  const subscribeWithAnswer = (
    params: { boardId: number; answer: string },
    options?: MutateOptions
  ) => {
    subscribeWithAnswerAction(
      { boardId: params.boardId, answer: params.answer },
      {
        onSuccess: () => {
          invalidateBoardQueries();
          options?.onSuccess?.();
        },
      }
    );
  };

  return {
    handleSubscribe,
    handleBlock,
    handleUnsubscribe,
    cancelSubscriptionRequest,
    subscribeWithAnswer,
    isSubscribing: isSubscribingWithoutAnswer || isSubscribingWithAnswer,
    isBlocking,
    isUnsubscribing,
  };
}
