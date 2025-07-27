import * as React from "react";
import { useRouter } from "next/navigation";
import { Portal } from "@radix-ui/react-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn, debounce } from "@/lib/utils";
import { BoardSelect } from "@/components/board-select";
import { useBoardChildrenStore } from "@/store/board-children";
import { useMarkdownEditor } from "@/store/md-editor";
import { Editor } from "@/components/editor/editor";
import { AlertTriangle, Reply } from "lucide-react";
import { AttachmentType } from "@/constants/attachment-type";
import { usePostEditorStore } from "@/store/post-editor";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useDraftStore } from "@/store/draft";

import { PollEditor } from "./poll-editor";
import { PollPreview } from "./poll-preview";
import {
  DiscussionForm,
  PollForm,
  discussionSchema,
  pollSchema,
} from "@/validations/discussion";
import { Board } from "@/types/board";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const initDiscussionForm: DiscussionForm = {
  slug: "",
  title: "",
  content: "",
  board_id: 0,
  board_child_id: undefined as number | undefined,
  attachments: [] as {
    id: number;
    file_name: string;
    file_type: string;
    file_path: string;
  }[],
};

const initPollForm: PollForm = {
  options: ["", ""],
  is_multiple: 0,
  show_voter: 0,
  is_timed: 0,
  end_time: "",
};

interface ModalState {
  isSubmitting: boolean;
  isEditorFullscreen: boolean;
  showConfirmDialog: boolean;
  errors: string | null;
  loadingChildren: boolean;
}

interface PollState {
  form: PollForm;
  data: PollForm | null;
  isEditing: boolean;
}

export default function CreatePostModal() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(
    null
  );

  const [modalState, dispatch] = React.useReducer(modalReducer, {
    isSubmitting: false,
    isEditorFullscreen: false,
    showConfirmDialog: false,
    errors: null,
    loadingChildren: false,
  });

  const [pollState, dispatchPoll] = React.useReducer(pollReducer, {
    form: initPollForm,
    data: null,
    isEditing: false,
  });

  const [discussionForm, setDiscussionForm] =
    React.useState(initDiscussionForm);
  const [selectedBoard, setSelectedBoard] = React.useState<Board | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = React.useState(0);
  const {
    content,
    setContent,
    hasUnsavedContent,
    setHasUnsavedContent,
    setIsOpen,
    setOnClose,
  } = useMarkdownEditor();
  const {
    isVisible,
    setIsVisible,
    openFrom,
    discussion,
    boardPreselect,
    setBoardPreselect,
  } = usePostEditorStore();
  const { draft, hasDraft, setDraft } = useDraftStore();
  const editorRef = React.useRef<{ reset: () => void; isFullscreen: boolean }>(
    null
  );
  const boardSelectRef = React.useRef<{ reset: () => void }>(null);
  const [isEditorFullscreen, setIsEditorFullscreen] = React.useState(false);

  const { boardChildren, setBoardChildren: setBoardChildren } =
    useBoardChildrenStore();

  // 从草稿加载内容
  React.useEffect(() => {
    if (isVisible && openFrom === "draft" && hasDraft && draft) {
      setDiscussionForm((prev) => ({
        ...prev,
        title: draft.title || "",
        board_id: draft.board_id || 0,
        board_child_id: draft.board_child_id,
      }));
      setContent(draft.content || "");
      if (draft.poll) {
        dispatchPoll({ type: "SET_DATA", payload: draft.poll });
      }
    }
  }, [isVisible, hasDraft, draft]);

  // 预设看板查询
  const { data: preselectedBoard } = useQuery({
    queryKey: ["board", boardPreselect?.boardId],
    queryFn: () => api.boards.get({ id: boardPreselect!.boardId }),
    enabled: !!(isVisible && openFrom === "create" && boardPreselect),
    staleTime: 0,
    gcTime: 0,
  });

  // 从预设的看板信息加载
  React.useEffect(() => {
    if (isVisible && openFrom === "create" && boardPreselect) {
      setDiscussionForm((prev) => ({
        ...prev,
        board_id: boardPreselect.boardId,
        board_child_id: boardPreselect.boardChildId,
      }));

      setBoardPreselect(undefined);
    }
  }, [isVisible, openFrom, boardPreselect, setBoardPreselect]);

  // 设置预选看板数据
  React.useEffect(() => {
    if (preselectedBoard) {
      setSelectedBoard(preselectedBoard);
      setForceUpdateKey((prev) => prev + 1);
    }
  }, [preselectedBoard]);

  // 当 board_id 为 0 或未定义时，重置 selectedBoard
  React.useEffect(() => {
    if (!discussionForm.board_id) {
      setSelectedBoard(null);
    }
  }, [discussionForm.board_id]);

  React.useEffect(() => {
    if (discussionForm.board_id && !selectedBoard) {
      const fetchBoardDetail = async () => {
        try {
          const boardData = await api.boards.get({
            id: discussionForm.board_id,
          });
          setSelectedBoard(boardData);
        } catch (error) {
          console.error("Failed to fetch board detail:", error);
        }
      };
      fetchBoardDetail();
    }
  }, [discussionForm.board_id, selectedBoard]);

  const updateSelectedBoard = React.useCallback(
    (boardId: number, board?: Board) => {
      // 如果已经有相同的selectedBoard，不再更新
      if (selectedBoard && selectedBoard.id === boardId) {
        return;
      }

      if (board) {
        setSelectedBoard(board);
        setForceUpdateKey((prev) => prev + 1);
      } else if (boardId) {
        // 异步获取看板详情
        api.boards
          .get({ id: boardId })
          .then((boardData) => {
            // 确保board_id没有变化
            if (boardId === discussionForm.board_id) {
              setSelectedBoard(boardData);
              setForceUpdateKey((prev) => prev + 1);
            }
          })
          .catch(console.error);
      }
    },
    [selectedBoard, discussionForm.board_id]
  );

  React.useEffect(() => {
    if (discussionForm.board_id && !selectedBoard) {
      updateSelectedBoard(discussionForm.board_id);
    }
  }, [discussionForm.board_id, selectedBoard, updateSelectedBoard]);

  React.useEffect(() => {
    if (isVisible && openFrom === "edit" && discussion) {
      // 获取文章详情
      const fetchDiscussion = async () => {
        try {
          const data = await api.discussions.getRaw(discussion.slug);
          setDiscussionForm({
            slug: data.slug,
            title: data.title,
            content: data.raw_content,
            board_id: data.board_id,
            board_child_id: data.board_child_id,
          });
          setContent(data.raw_content);
          if (data.poll) {
            dispatchPoll({
              type: "SET_DATA",
              payload: {
                ...data.poll,
                end_time: data.poll.end_time ?? "",
                options: data.poll.options.map((option) => option.option),
              },
            });
          }
        } catch (error) {
          toast({
            title: "获取文章失败",
            description: error.message || "获取文章详情失败，请重试",
            variant: "destructive",
          });
        }
      };
      fetchDiscussion();
    }
  }, [isVisible, openFrom, discussion]);

  // 监听编辑器全屏状态变化
  const handleFullscreenChange = React.useCallback((fullscreen: boolean) => {
    setIsEditorFullscreen(fullscreen);
  }, []);

  const resetPollState = React.useCallback(() => {
    dispatchPoll({ type: "RESET" });
  }, []);

  const resetDiscussionState = React.useCallback(() => {
    setDiscussionForm(initDiscussionForm);
    editorRef.current?.reset?.();
    boardSelectRef.current?.reset?.();
  }, []);

  const resetModalState = React.useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const resetAllStates = React.useCallback(() => {
    resetPollState();
    resetDiscussionState();
    resetModalState();
    setPendingAction(null);
    setHasUnsavedContent(false);
    // 重置post-editor存储中的boardPreselect
    setBoardPreselect(undefined);
  }, [
    resetPollState,
    resetDiscussionState,
    resetModalState,
    setBoardPreselect,
  ]);

  const handlePollConfirm = React.useCallback(() => {
    try {
      const validatedData = pollSchema.parse(pollState.form);
      dispatchPoll({ type: "SET_DATA", payload: validatedData });
      dispatchPoll({ type: "SET_EDITING", payload: false });
      dispatch({ type: "SET_ERRORS", payload: null });
    } catch (error) {
      if (error instanceof z.ZodError) {
        dispatch({ type: "SET_ERRORS", payload: error.errors[0].message });
      } else {
        dispatch({ type: "SET_ERRORS", payload: "验证失败" });
      }
    }
  }, [pollState.form]);

  const updatePollForm = React.useCallback((field: string, value: any) => {
    dispatchPoll({ type: "UPDATE_FORM", payload: { field, value } });
    dispatch({ type: "SET_ERRORS", payload: null });
  }, []);

  const handleDeletePoll = React.useCallback(() => {
    dispatchPoll({ type: "DELETE" });
  }, []);

  const handlePollEdit = React.useCallback(() => {
    if (!pollState.data) return;
    dispatchPoll({ type: "EDIT" });
  }, [pollState.data]);

  // 4. 加载状态优化：使用 loading 状态管理
  const loadBoardChildren = React.useCallback(
    async (boardId: number) => {
      // 如果模态框不可见，跳过请求
      if (!isVisible) {
        return;
      }

      // 如果正在加载，跳过重复请求
      if (modalState.loadingChildren) {
        return;
      }

      // 如果board_id为0或未定义，不进行加载
      if (!boardId) {
        return;
      }

      // 添加一个标志，标记当前正在处理的boardId
      const processingBoardId = boardId;

      try {
        dispatch({ type: "SET_LOADING_CHILDREN", payload: true });
        const data = await api.boards.getChildren(boardId);

        // 确保当前处理的仍然是同一个boardId，避免竞态条件
        // 同时确保模态框仍然可见
        if (processingBoardId === discussionForm.board_id && isVisible) {
          setBoardChildren(data);

          // 只在没有设置子版块ID且有子版块时设置默认子版块
          if (!discussionForm.board_child_id && data.items.length > 0) {
            const defaultChild = data.items.find(
              (child) => child.is_default === 1
            );
            if (defaultChild) {
              // 使用函数式更新，确保使用最新的状态
              setDiscussionForm((prev) => {
                // 如果已经有了board_child_id，不再更新
                if (prev.board_child_id) return prev;
                return {
                  ...prev,
                  board_child_id: defaultChild.id,
                };
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load board children:", error);
      } finally {
        // 只有当前处理的仍然是同一个boardId且模态框仍然可见时，才更新loading状态
        if (processingBoardId === discussionForm.board_id && isVisible) {
          dispatch({ type: "SET_LOADING_CHILDREN", payload: false });
        }
      }
    },
    [
      setBoardChildren,
      setDiscussionForm,
      modalState.loadingChildren,
      discussionForm.board_id,
      discussionForm.board_child_id,
      isVisible,
    ]
  );

  const handlePublish = React.useCallback(async () => {
    try {
      const validatedDiscussion = discussionSchema.parse({
        ...discussionForm,
        content: content.trim(),
        poll: pollState.data,
      });

      dispatch({ type: "SET_SUBMITTING", payload: true });

      const data = {
        slug: validatedDiscussion.slug,
        title: validatedDiscussion.title,
        content: validatedDiscussion.content,
        board_id: validatedDiscussion.board_id,
        board_child_id: validatedDiscussion.board_child_id,
        attachments: validatedDiscussion.attachments,
        poll: validatedDiscussion.poll,
      };

      const discussion = await api.discussions.create(data);
      resetAllStates();
      router.push(`/d/${discussion.slug}?board_id=${discussion.board_id}`);
      setIsVisible(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        dispatch({ type: "SET_ERRORS", payload: error.errors[0].message });
      } else {
        dispatch({ type: "SET_ERRORS", payload: "发布失败" });
      }
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [
    discussionForm,
    content,
    pollState.data,
    resetAllStates,
    router,
    setIsVisible,
  ]);

  const debouncedHandlePublish = React.useMemo(
    () => debounce(handlePublish, 300), // 300ms 的防抖时间
    [handlePublish]
  );

  // 计算投票按钮的禁用状态
  const isPollButtonDisabled = React.useMemo(() => {
    if (!!pollState.data || pollState.isEditing) return true;
    if (!selectedBoard) return true;
    if (!selectedBoard.board_user) return true;
    if (!selectedBoard.poll_role) return true;
    return !selectedBoard.poll_role.includes(
      selectedBoard.board_user.user_role
    );
  }, [pollState.data, pollState.isEditing, selectedBoard, forceUpdateKey]);

  function modalReducer(
    state: ModalState,
    action: { type: string; payload?: any }
  ): ModalState {
    switch (action.type) {
      case "SET_SUBMITTING":
        return { ...state, isSubmitting: action.payload };
      case "SET_EDITOR_FULLSCREEN":
        return { ...state, isEditorFullscreen: action.payload };
      case "SET_SHOW_CONFIRM_DIALOG":
        return { ...state, showConfirmDialog: action.payload };
      case "SET_ERRORS":
        return { ...state, errors: action.payload };
      case "SET_LOADING_CHILDREN":
        return { ...state, loadingChildren: action.payload };
      case "RESET":
        return {
          isSubmitting: false,
          isEditorFullscreen: false,
          showConfirmDialog: false,
          errors: null,
          loadingChildren: false,
        };
      default:
        return state;
    }
  }

  function pollReducer(
    state: PollState,
    action: { type: string; payload?: any }
  ): PollState {
    switch (action.type) {
      case "SET_DATA":
        return { ...state, data: action.payload };
      case "SET_EDITING":
        return { ...state, isEditing: action.payload };
      case "UPDATE_FORM":
        return {
          ...state,
          form: { ...state.form, [action.payload.field]: action.payload.value },
        };
      case "DELETE":
        return { ...state, data: null, form: initPollForm, isEditing: false };
      case "EDIT":
        if (!state.data) {
          return { ...state, form: initPollForm, isEditing: true };
        }
        return { ...state, form: state.data, isEditing: true };
      case "RESET":
        return {
          form: initPollForm,
          data: null,
          isEditing: false,
        };
      default:
        return state;
    }
  }

  // 使用useRef存储上一次加载的boardId，避免重复加载
  const lastLoadedBoardIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    // 如果模态框不可见，不加载数据，同时清空上一次加载的boardId
    if (!isVisible) {
      lastLoadedBoardIdRef.current = null;
      return;
    }

    // 如果board_id为0或未定义，不进行加载
    if (!discussionForm.board_id) {
      setBoardChildren({
        code: 0,
        items: [],
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        message: "",
      });
      return;
    }

    // 如果board_id没有变化，不重新加载
    if (discussionForm.board_id === lastLoadedBoardIdRef.current) {
      return;
    }

    // 更新上一次加载的boardId
    lastLoadedBoardIdRef.current = discussionForm.board_id;

    // 使用setTimeout实现简单的防抖，避免频繁调用
    const timeoutId = setTimeout(() => {
      loadBoardChildren(discussionForm.board_id);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [discussionForm.board_id, loadBoardChildren, setBoardChildren, isVisible]);

  React.useEffect(() => {
    const hasUnsaved =
      discussionForm.title.trim() !== "" ||
      discussionForm.content.trim() !== "" ||
      (discussionForm.attachments && discussionForm.attachments.length > 0) ||
      pollState.data !== null ||
      pollState.isEditing;
    setHasUnsavedContent(hasUnsaved);
    return () => {
      setHasUnsavedContent(false);
    };
  }, [
    discussionForm.title,
    discussionForm.content,
    discussionForm.attachments,
    pollState.data,
    pollState.isEditing,
    setHasUnsavedContent,
  ]);

  React.useEffect(() => {
    if (isVisible) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedContent) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isVisible, hasUnsavedContent]);

  const handleClose = React.useCallback(() => {
    resetAllStates();
    setIsVisible(false);
  }, [resetAllStates, setIsVisible]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, handleClose]);

  React.useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // 当模态框关闭时重置状态
  React.useEffect(() => {
    if (!isVisible) {
      resetAllStates();
      usePostEditorStore.setState({ discussion: undefined });
      // 重置lastLoadedBoardIdRef，确保下次打开时能正确加载数据
      lastLoadedBoardIdRef.current = null;
    }
  }, [isVisible, resetAllStates]);

  React.useEffect(() => {
    setIsOpen(isVisible);
    setOnClose((confirmed?: boolean) => {
      if (hasUnsavedContent && !confirmed) {
        dispatch({ type: "SET_SHOW_CONFIRM_DIALOG", payload: true });
        setPendingAction(() => () => {
          dispatch({ type: "SET_SHOW_CONFIRM_DIALOG", payload: false });
          setIsVisible(false);
        });
      } else {
        setIsVisible(false);
      }
    });
    return () => {
      setIsOpen(false);
      setOnClose(null);
    };
  }, [isVisible, hasUnsavedContent, setIsVisible, setIsOpen, setOnClose]);

  const handleSaveDraft = useMutation({
    mutationFn: () => {
      if (!discussionForm.board_id) {
        throw new Error("请选择版块");
      }
      if (!discussionForm.title.trim()) {
        throw new Error("请输入标题");
      }

      return api.discussions.saveDraft({
        title: discussionForm.title,
        content: content,
        board_id: discussionForm.board_id,
        board_child_id: discussionForm.board_child_id,
        poll: pollState.data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "成功",
        description: "草稿保存成功",
      });
      setHasUnsavedContent(false);
      setDraft({
        ...data,
      });
    },
    onError: (error) => {
      toast({
        title: "保存失败",
        description: error.message || "保存草稿失败，请重试",
        variant: "destructive",
      });
    },
  });

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 top-14 z-40 transform bg-background transition-transform duration-500 ease-out overflow-y-auto pb-14 lg:pb-0",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-theme-background min-h-[calc(100vh-3.5rem)] flex flex-col mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-lg font-medium leading-none whitespace-nowrap">
                  {openFrom === "edit" ? "编辑文章" : "发布文章"}
                </h1>
                <div className="w-full min-w-[260px] sm:w-auto">
                  <BoardSelect
                    ref={boardSelectRef}
                    value={discussionForm.board_id}
                    board={selectedBoard}
                    onChange={(value, board) => {
                      // 如果选择的是同一个看板，不进行任何操作
                      if (value === discussionForm.board_id) return;

                      // 一次性更新所有状态，避免多次渲染
                      const updateStates = () => {
                        // 更新discussionForm
                        setDiscussionForm((prev) => ({
                          ...prev,
                          board_id: value,
                          board_child_id: undefined, // 重置子版块ID
                        }));

                        // 如果提供了board对象，直接使用它
                        if (board) {
                          setSelectedBoard(board);
                          setForceUpdateKey((prev) => prev + 1);
                        } else {
                          // 否则通过updateSelectedBoard函数获取
                          updateSelectedBoard(value);
                        }
                      };

                      // 执行状态更新
                      updateStates();
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={handleClose}
                >
                  取消
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={() => {
                    if (!pollState.data && !pollState.isEditing) {
                      dispatchPoll({ type: "EDIT" });
                    }
                  }}
                  disabled={isPollButtonDisabled}
                  title={
                    isPollButtonDisabled ? "您没有在当前看板发起投票的权限" : ""
                  }
                >
                  投票
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={() => handleSaveDraft.mutate()}
                  disabled={handleSaveDraft.isPending}
                >
                  {handleSaveDraft.isPending ? "保存中..." : "保存草稿箱"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full w-full sm:w-auto"
                  onClick={debouncedHandlePublish}
                  disabled={modalState.isSubmitting}
                >
                  {modalState.isSubmitting ? "发布中..." : "发布"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t py-4">
            <h3 className="text-sm font-medium mb-2">子版</h3>
            <div className="flex flex-wrap gap-2">
              {modalState.loadingChildren ? (
                <div className="text-sm text-muted-foreground">加载中...</div>
              ) : boardChildren.items.length > 0 ? (
                boardChildren.items.map((child) => (
                  <Badge
                    key={child.id}
                    variant={
                      discussionForm.board_child_id === child.id
                        ? "default"
                        : "secondary"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setDiscussionForm((prev) => ({
                        ...prev,
                        board_child_id: child.id,
                      }))
                    }
                  >
                    {child.name}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">暂无子版</div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="py-4">
              <Input
                className="text-xl py-4"
                value={discussionForm.title}
                onChange={(e) =>
                  setDiscussionForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="输入标题..."
              />
              {modalState.errors && (
                <div className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{modalState.errors}</span>
                </div>
              )}
              <div className="mt-4">
                {pollState.isEditing && !modalState.isEditorFullscreen ? (
                  <PollEditor
                    values={pollState.form || initPollForm}
                    onChange={updatePollForm}
                    error={modalState.errors}
                    onCancel={() => dispatchPoll({ type: "DELETE" })}
                    onConfirm={handlePollConfirm}
                  />
                ) : !pollState.isEditing &&
                  pollState.data &&
                  !modalState.isEditorFullscreen ? (
                  <PollPreview
                    pollData={pollState.data}
                    onDelete={handleDeletePoll}
                    onEdit={handlePollEdit}
                  />
                ) : null}
              </div>

              <Editor
                ref={editorRef}
                placeholder="开始编写正文..."
                className={cn(
                  "min-h-[300px] sm:min-h-[400px]",
                  isEditorFullscreen && "z-50"
                )}
                attachmentType={AttachmentType.TOPIC}
                initialContent={content}
                onChange={setContent}
                onFullscreenChange={handleFullscreenChange}
                onPublish={debouncedHandlePublish}
                publishLoading={modalState.isSubmitting}
                publishText="发布"
                headerInfo={{
                  icon: <Reply className="h-4 w-4 text-muted-foreground" />,
                  title: discussionForm.title,
                  onMaximize: () => {},
                  onClose: handleClose,
                }}
                boardId={discussionForm.board_id || undefined}
                onAttachmentUpload={(attachment) => {
                  // 将 Attachment 类型转换为 discussionForm.attachments 所需的格式
                  const formattedAttachment = {
                    id: attachment.id,
                    file_name: attachment.file_name,
                    file_type: attachment.mime_type,
                    file_path: attachment.file_path,
                  };

                  setDiscussionForm((prev) => ({
                    ...prev,
                    attachments: [
                      ...(prev.attachments || []),
                      formattedAttachment,
                    ],
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 确认离开对话框 */}
      <ConfirmDialog
        open={modalState.showConfirmDialog}
        onOpenChange={(value) =>
          dispatch({ type: "SET_SHOW_CONFIRM_DIALOG", payload: value })
        }
        title="确认离开？"
        description="你有未保存的内容，确定要离开吗？"
        confirmText="确认离开"
        cancelText="取消"
        onConfirm={() => pendingAction?.()}
        variant="destructive"
      />
    </Portal>
  );
}
