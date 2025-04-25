import { create } from "zustand";

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
  hasUnsavedContent: boolean;
  isOpen: boolean;

  uploadingFiles: File[];
  mentions: string[];

  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;

  insertText: (
    text: string,
    position?: number,
    before?: number,
    after?: number
  ) => void;
  wrapSelection: (before: string, after: string) => void;

  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  addMention: (username: string) => void;

  parseContent: () => Promise<string>;
  setParsedContent: (html: string | null) => void;

  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
}

const MAX_HISTORY = 50;

export const useMarkdownEditor = create<
  EditorState & EditorActions & MarkdownEditorStore
>((set, get) => ({
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

    const finalPos = Math.min(newContent.length, newPos + text.length);
    state.setSelection({
      start: finalPos,
      end: finalPos,
    });

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

    if (start === end) {
      const newText = before + after;
      const newContent =
        state.content.slice(0, start) + newText + state.content.slice(end);

      state.setContent(newContent);
      state.setSelection({
        start: start + before.length,
        end: start + before.length,
      });
      return;
    }

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
