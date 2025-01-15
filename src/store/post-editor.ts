import { create } from "zustand";
import { useMarkdownEditor } from "./md-editor";

interface PostEditorStore {
  hasUnsavedContent: boolean;
  isOpen: boolean;
  uploadingFiles: File[];
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  insertText: (text: string) => void;
}

export const usePostEditorStore = create<PostEditorStore>((set) => {
  const insertText = (text: string) => {
    const editor = useMarkdownEditor.getState();
    editor.insertText(text);
  };

  return {
    hasUnsavedContent: false,
    isOpen: false,
    onClose: null,
    uploadingFiles: [],
    setHasUnsavedContent: (hasUnsavedContent) => set({ hasUnsavedContent }),
    setIsOpen: (isOpen) => set({ isOpen }),
    setOnClose: (onClose) => set({ onClose }),
    addUploadingFile: (file) => set((state) => ({ 
      uploadingFiles: [...state.uploadingFiles, file] 
    })),
    removeUploadingFile: (file) => set((state) => ({ 
      uploadingFiles: state.uploadingFiles.filter(f => f !== file) 
    })),
    insertText,
  };
});
