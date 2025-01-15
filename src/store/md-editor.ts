import { create } from "zustand";

interface Selection {
  start: number;
  end: number;
}

interface History {
  past: string[];
  future: string[];
}

interface MarkdownEditorStore {
  // 基础状态
  content: string;
  hasUnsavedContent: boolean;
  isOpen: boolean;
  
  // 编辑器状态
  selection: Selection;
  previewMode: boolean;
  uploadingFiles: File[];
  history: History;
  mentions: string[];
  
  // 基础方法
  setContent: (content: string) => void;
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  setSelection: (selection: Selection) => void;
  setPreviewMode: (previewMode: boolean) => void;
  
  // Markdown 编辑方法
  insertText: (text: string, position?: number) => void;
  wrapSelection: (before: string, after: string) => void;
  
  // 历史记录
  undo: () => void;
  redo: () => void;
  
  // 文件和扩展功能
  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  addMention: (username: string) => void;
  
  // 关闭回调
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
}

const MAX_HISTORY_LENGTH = 50;

export const useMarkdownEditor = create<MarkdownEditorStore>((set, get) => ({
  // 初始状态
  content: "",
  hasUnsavedContent: false,
  isOpen: false,
  selection: { start: 0, end: 0 },
  previewMode: false,
  uploadingFiles: [],
  history: { past: [], future: [] },
  mentions: [],
  onClose: null,

  // 基础方法
  setContent: (content) => {
    const currentState = get();
    set({
      content,
      hasUnsavedContent: true,
      history: {
        past: [...currentState.history.past.slice(-MAX_HISTORY_LENGTH), currentState.content],
        future: [],
      },
    });
  },
  
  setHasUnsavedContent: (hasUnsavedContent) => set({ hasUnsavedContent }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setSelection: (selection) => set({ selection }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setOnClose: (onClose) => set({ onClose }),

  // Markdown 编辑方法
  insertText: (text, position) => {
    const state = get();
    const pos = position ?? state.selection.start;
    const newContent = 
      state.content.slice(0, pos) + 
      text + 
      state.content.slice(pos);
    
    state.setContent(newContent);
    state.setSelection({ 
      start: pos + text.length, 
      end: pos + text.length 
    });
  },

  wrapSelection: (before, after) => {
    const state = get();
    const { start, end } = state.selection;
    const selectedText = state.content.slice(start, end);
    const newText = before + selectedText + after;
    
    const newContent = 
      state.content.slice(0, start) + 
      newText + 
      state.content.slice(end);
    
    state.setContent(newContent);
    state.setSelection({ 
      start: start + before.length, 
      end: end + before.length 
    });
  },

  // 历史记录方法
  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);

    set({
      content: previous,
      history: {
        past: newPast,
        future: [state.content, ...state.history.future],
      },
    });
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);

    set({
      content: next,
      history: {
        past: [...state.history.past, state.content],
        future: newFuture,
      },
    });
  },

  // 文件和扩展功能方法
  addUploadingFile: (file) => 
    set((state) => ({ 
      uploadingFiles: [...state.uploadingFiles, file] 
    })),

  removeUploadingFile: (file) =>
    set((state) => ({
      uploadingFiles: state.uploadingFiles.filter((f) => f !== file)
    })),

  addMention: (username) => {
    const state = get();
    state.insertText(`@${username} `);
    set((state) => ({ 
      mentions: [...state.mentions, username] 
    }));
  },
}));
