import { create } from 'zustand';

interface BoardChild {
  board_id: number;
  name: string;
  creator_hashid: string;
  is_default: number;
  sort: number;
  id: number;
}

interface BoardChildrenState {
  boardChildrenMap: Record<number, BoardChild[]>;
  setBoardChildren: (boardId: number, children: BoardChild[]) => void;
  getBoardChildren: (boardId: number) => BoardChild[] | undefined;
}

export const useBoardChildrenStore = create<BoardChildrenState>((set, get) => ({
  boardChildrenMap: {},
  setBoardChildren: (boardId, children) => {
    set((state) => ({
      boardChildrenMap: {
        ...state.boardChildrenMap,
        [boardId]: children,
      },
    }));
  },
  getBoardChildren: (boardId) => {
    return get().boardChildrenMap[boardId];
  },
}));
