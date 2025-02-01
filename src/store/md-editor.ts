import { create } from "zustand";
// import { formatterApi } from "@/services/formatter";

interface Selection {
  start: number;
  end: number;
}

interface History {
  past: string[];
  future: string[];
}

interface EditorState {
  content: string;
  selection: Selection;
  previewMode: boolean;
  history: History;
  parsedContent: string | null;
}

interface EditorActions {
  setContent: (content: string) => void;
  setSelection: (selection: Selection) => void;
  setPreviewMode: (mode: boolean) => void;
  undo: () => void;
  redo: () => void;
}

interface MarkdownEditorStore {
  // 基础状态
  hasUnsavedContent: boolean;
  isOpen: boolean;

  // 编辑器状态
  uploadingFiles: File[];
  mentions: string[];

  // 基础方法
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;

  // Markdown 编辑方法
  insertText: (
    text: string,
    position?: number,
    before?: number,
    after?: number
  ) => void;
  wrapSelection: (before: string, after: string) => void;

  // 文件和扩展功能
  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  addMention: (username: string) => void;

  // 服务器解析方法
  parseContent: () => Promise<string>;
  setParsedContent: (html: string | null) => void;

  // 关闭回调
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
}

const MAX_HISTORY = 50;

export const useMarkdownEditor = create<
  EditorState & EditorActions & MarkdownEditorStore
>((set, get) => ({
  // 初始状态
  content: "",
  hasUnsavedContent: false,
  isOpen: false,
  selection: { start: 0, end: 0 },
  previewMode: false,
  uploadingFiles: [],
  history: { past: [], future: [] },
  mentions: [],
  parsedContent: null,
  onClose: null,

  // 基础方法
  setContent: (content) =>
    set((state) => ({
      content,
      hasUnsavedContent: true,
      history: {
        past: [...state.history.past.slice(-MAX_HISTORY), state.content],
        future: [],
      },
    })),

  setHasUnsavedContent: (hasUnsavedContent) => set({ hasUnsavedContent }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setSelection: (selection) => set({ selection }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setOnClose: (onClose) => set({ onClose }),

  // Markdown 编辑方法
  insertText: (
    text: string,
    position?: number,
    before: number = 0,
    after: number = 0
  ) => {
    const state = get();
    const pos = position ?? Math.max(0, state.selection.start);
    const newPos = Math.min(state.content.length, pos + before);
    const newContent =
      state.content.slice(0, newPos) +
      text +
      state.content.slice(Math.min(state.content.length, pos + after));

    state.setContent(newContent);

    // 设置新的光标位置到插入文本的末尾
    const finalPos = Math.min(newContent.length, newPos + text.length);
    state.setSelection({
      start: finalPos,
      end: finalPos,
    });

    // 确保文本区域获得焦点并更新光标位置
    requestAnimationFrame(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(finalPos, finalPos);
      }
    });
  },

  wrapSelection: (before: string, after: string) => {
    const state = get();
    const { start, end } = state.selection;

    // 如果没有选择文本，在光标处插入
    if (start === end) {
      const newText = before + after;
      const newContent =
        state.content.slice(0, start) + newText + state.content.slice(end);

      state.setContent(newContent);
      // 将光标放在中间
      state.setSelection({
        start: start + before.length,
        end: start + before.length,
      });
      return;
    }

    // 处理选中文本的情况
    const selectedText = state.content.slice(start, end);
    const newText = before + selectedText + after;
    const newContent =
      state.content.slice(0, start) + newText + state.content.slice(end);

    state.setContent(newContent);
    state.setSelection({
      start: start + before.length,
      end: end + before.length,
    });
  },

  // 历史记录方法
  undo: () =>
    set((state) => {
      const previous = state.history.past[state.history.past.length - 1];
      if (!previous) return state;

      return {
        content: previous,
        history: {
          past: state.history.past.slice(0, -1),
          future: [state.content, ...state.history.future],
        },
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.history.future[0];
      if (!next) return state;

      return {
        content: next,
        history: {
          past: [...state.history.past, state.content],
          future: state.history.future.slice(1),
        },
      };
    }),

  // 服务器解析方法
  parseContent: async () => {
    const { content } = get();
    try {
      //   const html = await formatterApi.parse(content);
      return "<p>Test</p>";
      //   set({ parsedContent: html });
      //   return html;
    } catch (error) {
      console.error("Failed to parse content:", error);
      throw error;
    }
  },

  setParsedContent: (html) => set({ parsedContent: html }),

  // 文件和扩展功能方法
  addUploadingFile: (file) =>
    set((state) => ({
      uploadingFiles: [...state.uploadingFiles, file],
    })),

  removeUploadingFile: (file) =>
    set((state) => ({
      uploadingFiles: state.uploadingFiles.filter((f) => f !== file),
    })),

  addMention: (username) => {
    const state = get();
    state.insertText(`@${username} `);
    set((state) => ({
      mentions: [...state.mentions, username],
    }));
  },
}));
