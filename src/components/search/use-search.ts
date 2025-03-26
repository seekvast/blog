import * as React from "react";
import { useRouter } from "next/navigation";

interface Board {
  name: string;
  members: number;
  category: string;
  avatar: string;
}

export function useSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState("");
  const [histories, setHistories] = React.useState<string[]>([
    "网页设计",
    "便宜小鸡",
    "黑色星期五",
    "色图",
    "大姐姐",
  ]);
  const [popularBoards, setPopularBoards] = React.useState<Board[]>([
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      // 保存到最近搜索
      if (!histories.includes(keyword)) {
        setHistories((prev) => [keyword, ...prev.slice(0, 4)]);
      }
      router.push(`/explore?q=${keyword}`);
      return true;
    }
    return false;
  };

  const handleClearHistories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistories([]);
  };

  const handleSearchItemClick = (search: string) => {
    setKeyword(search);
    router.push(`/explore?q=${search}`);
    return true;
  };

  return {
    keyword,
    setKeyword,
    histories,
    setHistories,
    popularBoards,
    handleSearch,
    handleClearHistories,
    handleSearchItemClick,
  };
}
