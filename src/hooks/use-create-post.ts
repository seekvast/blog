import * as React from "react";
import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { usePostEditorStore } from "@/store/post-editor";
import { useDraftStore } from "@/store/draft";
import { discussionSchema, pollSchema, DiscussionForm, PollForm } from "@/validations/discussion";
import { Board } from "@/types/board";

// 初始状态定义
const initDiscussionForm: DiscussionForm = {
  slug: "",
  title: "",
  content: "",
  board_id: 0,
  board_child_id: 0,
  attachments: [],
};

const initPollForm: PollForm = {
  options: ["", ""],
  is_multiple: 0,
  show_voter: 0,
  is_timed: 0,
  end_time: "",
};

// State 和 Action 的类型定义
interface PostState {
  discussionForm: DiscussionForm;
  pollForm: PollForm;
  pollData: PollForm | null;
  isPollEditing: boolean;
  selectedBoard: Board | null;
  errors: string | null;
  hasUnsavedContent: boolean;
}

type Action =
  | { type: "SET_DISCUSSION_FIELD"; payload: { field: keyof DiscussionForm; value: any } }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_POLL_FORM_FIELD"; payload: { field: keyof PollForm; value: any } }
  | { type: "START_POLL_EDIT" }
  | { type: "CONFIRM_POLL" }
  | { type: "DELETE_POLL" }
  | { type: "CANCEL_POLL_EDIT" }
  | { type: "LOAD_DRAFT"; payload: { draft: any; content: string } }
  | { type: "LOAD_DISCUSSION_FOR_EDIT"; payload: { discussion: any; content: string } }
  | { type: "SET_BOARD"; payload: { boardId: number; board?: Board; boardChildId?: number } }
  | { type: "SET_SELECTED_BOARD"; payload: Board | null }
  | { type: "SET_ERRORS"; payload: string | null }
  | { type: "RESET" };

// Reducer: 所有状态修改的唯一入口
const postReducer = (state: PostState, action: Action): PostState => {
  switch (action.type) {
    case "SET_DISCUSSION_FIELD":
      return { ...state, discussionForm: { ...state.discussionForm, [action.payload.field]: action.payload.value } };
    case "SET_CONTENT":
        return { ...state, discussionForm: { ...state.discussionForm, content: action.payload } };
    case "SET_POLL_FORM_FIELD":
      return { ...state, pollForm: { ...state.pollForm, [action.payload.field]: action.payload.value } };
    case "START_POLL_EDIT":
      return { ...state, pollForm: state.pollData || initPollForm, isPollEditing: true };
    case "CONFIRM_POLL":
      try {
        const validatedPoll = pollSchema.parse(state.pollForm);
        return { ...state, pollData: validatedPoll, isPollEditing: false, errors: null };
      } catch (e) {
        if (e instanceof z.ZodError) {
          return { ...state, errors: e.errors[0].message };
        }
        return { ...state, errors: "Poll validation failed." };
      }
    case "DELETE_POLL":
      return { ...state, pollData: null, pollForm: initPollForm, isPollEditing: false };
    case "CANCEL_POLL_EDIT":
        return { ...state, isPollEditing: false, pollForm: initPollForm, errors: null };
    case "LOAD_DRAFT":
        const { draft, content } = action.payload;
        return {
            ...state,
            discussionForm: {
                ...state.discussionForm,
                title: draft.title || "",
                board_id: draft.board_id || 0,
                board_child_id: draft.board_child_id,
                content: content,
            },
            pollData: draft.poll || null,
        };
    case "LOAD_DISCUSSION_FOR_EDIT":
        const { discussion } = action.payload;
        return {
            ...state,
            discussionForm: {
                slug: discussion.slug,
                title: discussion.title,
                content: discussion.raw_content,
                board_id: discussion.board_id,
                board_child_id: discussion.board_child_id,
            },
            pollData: discussion.poll ? {
                ...discussion.poll,
                end_time: discussion.poll.end_time ?? "",
                options: discussion.poll.options.map((opt: any) => opt.option),
            } : null,
        };
    case "SET_BOARD":
      return {
        ...state,
        discussionForm: { ...state.discussionForm, board_id: action.payload.boardId, board_child_id: action.payload.boardChildId },
        selectedBoard: action.payload.board || state.selectedBoard,
      };
    case "SET_SELECTED_BOARD":
        return { ...state, selectedBoard: action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "RESET":
      return {
        ...state,
        discussionForm: initDiscussionForm,
        pollForm: initPollForm,
        pollData: null,
        isPollEditing: false,
        selectedBoard: null,
        errors: null,
        hasUnsavedContent: false,
      };
    default:
      return state;
  }
};

export function useCreatePost() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { isVisible, setIsVisible, openFrom, discussion, boardPreselect, setBoardPreselect } = usePostEditorStore();
  const { draft, hasDraft, setDraft } = useDraftStore();

  const initialState: PostState = {
    discussionForm: initDiscussionForm,
    pollForm: initPollForm,
    pollData: null,
    isPollEditing: false,
    selectedBoard: null,
    errors: null,
    hasUnsavedContent: false,
  };

  const [state, dispatch] = useReducer(postReducer, initialState);
  const { discussionForm, pollData, selectedBoard } = state;

  // 数据获取 (Data Fetching)
  useQuery({
    queryKey: ["board", boardPreselect?.boardId],
    queryFn: async () => {
        const board = await api.boards.get({ id: boardPreselect!.boardId });
        dispatch({ type: "SET_BOARD", payload: { boardId: board.id, board, boardChildId: boardPreselect?.boardChildId } });
        setBoardPreselect(undefined);
        return board;
    },
    enabled: !!(isVisible && openFrom === "create" && boardPreselect),
    staleTime: Infinity,
  });

  useQuery({
      queryKey: ["board", discussionForm.board_id],
      queryFn: async () => {
          const board = await api.boards.get({ id: discussionForm.board_id });
          dispatch({ type: "SET_SELECTED_BOARD", payload: board });
          return board;
      },
      enabled: !!(isVisible && discussionForm.board_id && !selectedBoard),
      staleTime: Infinity,
  });

  const { data: boardChildren, isLoading: isLoadingChildren } = useQuery({
      queryKey: ["boardChildren", discussionForm.board_id],
      queryFn: () => api.boards.getChildren(discussionForm.board_id),
      enabled: !!(isVisible && discussionForm.board_id),
      staleTime: 1000 * 60 * 5,
  });

  useQuery({
      queryKey: ['rawDiscussion', discussion?.slug],
      queryFn: async () => {
          const data = await api.discussions.getRaw(discussion!.slug);
          dispatch({ type: "LOAD_DISCUSSION_FOR_EDIT", payload: { discussion: data, content: data.raw_content } });
          return data;
      },
      enabled: !!(isVisible && openFrom === 'edit' && discussion),
      staleTime: Infinity,
  });

  // 数据提交 (Mutations)
  const mutationOptions = {
    onSuccess: (newDiscussion: any) => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      router.push(`/d/${newDiscussion.slug}?board_id=${newDiscussion.board_id}`);
      handleClose();
    },
    onError: (error: any) => {
      const message = error instanceof z.ZodError ? error.errors[0].message : "操作失败，请重试";
      dispatch({ type: "SET_ERRORS", payload: message });
      toast({ title: "错误", description: message, variant: "destructive" });
    },
  };

  const createDiscussionMutation = useMutation({
      mutationFn: (data: any) => api.discussions.create(data),
      ...mutationOptions
  });

  const saveDraftMutation = useMutation({
      mutationFn: (data: any) => api.discussions.saveDraft(data),
      onSuccess: (data: any) => {
          toast({ title: "成功", description: "草稿保存成功" });
          setDraft(data);
      },
      onError: (error: any) => toast({ title: "保存失败", description: error.message, variant: "destructive" }),
  });

  // 逻辑处理 (Handlers)
  const handlePublish = React.useCallback(() => {
    try {
      const finalContent = discussionForm.content.trim();
      if (!finalContent) {
          throw new Error("正文内容不能为空。");
      }
      const validatedData = discussionSchema.parse({ ...discussionForm, content: finalContent, poll: pollData });
      createDiscussionMutation.mutate(validatedData);
    } catch (e) {
        const message = e instanceof z.ZodError ? e.errors[0].message : (e as Error).message;
        dispatch({ type: "SET_ERRORS", payload: message });
    }
  }, [discussionForm, pollData, createDiscussionMutation]);

  const handleSaveDraft = React.useCallback(() => {
      if (!discussionForm.board_id || !discussionForm.title.trim()) {
          toast({ title: "无法保存", description: "请选择一个看版块并填写标题", variant: "destructive" });
          return;
      }
      saveDraftMutation.mutate({ ...discussionForm, poll: pollData });
  }, [discussionForm, pollData, saveDraftMutation, toast]);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    dispatch({ type: "RESET" });
  }, [setIsVisible]);

  const handleBoardChange = (boardId: number, board?: Board) => {
      if (boardId === discussionForm.board_id) return;
      dispatch({ type: "SET_BOARD", payload: { boardId, board } });
  }

  // 初始化加载逻辑
  React.useEffect(() => {
    if (isVisible && openFrom === "draft" && hasDraft && draft) {
      dispatch({ type: "LOAD_DRAFT", payload: { draft, content: draft.content || "" } });
    }
  }, [isVisible, openFrom, hasDraft, draft]);

  const isPollButtonDisabled = React.useMemo(() => {
      if (pollData || state.isPollEditing) return true;
      if (!selectedBoard || !selectedBoard.board_user || !selectedBoard.poll_role) return true;
      return !selectedBoard.poll_role.includes(selectedBoard.board_user.user_role);
  }, [pollData, state.isPollEditing, selectedBoard]);

  return {
    state,
    dispatch,
    isVisible,
    openFrom,
    boardChildren,
    isLoadingChildren,
    mutations: {
      createDiscussionMutation,
      saveDraftMutation,
    },
    handlers: {
      handlePublish,
      handleSaveDraft,
      handleClose,
      handleBoardChange,
    },
    computed: {
      isPollButtonDisabled,
      modalTitle: openFrom === 'edit' ? '编辑文章' : '发布文章',
    }
  };
}