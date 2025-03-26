import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/search-store";
import { api } from "@/lib/api";
import type { Board } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface SearchBoard {
  name: string;
  members: number;
  category: string;
  avatar: string;
}

export function useSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState("");
  const { histories, addHistory, clearHistories } = useSearchStore();

  const { data: hotBoards } = useQuery<Board[]>({
    queryKey: ["popularBoards"],
    queryFn: async () => {
      const boards = await api.boards.recommend({ q: "hot" });
      return boards;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      addHistory(keyword.trim());
      router.push(`/explore?q=${keyword}`);
      return true;
    }
    return false;
  };

  const handleSearchItemClick = (search: string) => {
    setKeyword(search);
    addHistory(search);
    router.push(`/explore?q=${search}`);
    return true;
  };

  return {
    keyword,
    setKeyword,
    histories,
    hotBoards,
    handleSearch,
    handleClearHistories: clearHistories,
    handleSearchItemClick,
  };
}
