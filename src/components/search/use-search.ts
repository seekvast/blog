import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/search-store";

interface Board {
  name: string;
  members: number;
  category: string;
  avatar: string;
}

export function useSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState("");
  const { histories, addHistory, clearHistories } = useSearchStore();
  const [popularBoards] = React.useState<Board[]>([
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
  ]);

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
    popularBoards,
    handleSearch,
    handleClearHistories: clearHistories,
    handleSearchItemClick,
  };
}
