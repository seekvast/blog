import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import { BoardDetail } from "./board-detail";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getDiscussionPreferences } from "@/lib/discussion-preferences-server";
import { getValidSortBy } from "@/lib/discussion-preferences";
import { SortBy, DisplayMode } from "@/types/display-preferences";
interface BoardPageProps {
  params: { slug: string };
  searchParams: {
    tab?: string;
    child?: string;
    sort?: string;
  };
}

export default async function BoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const { slug } = params;

  const activeTab = searchParams.tab || "posts";
  const childId = searchParams.child ? parseInt(searchParams.child, 1) : null;

  const prefsFromCookie = getDiscussionPreferences();
  const sortFromUrl = searchParams?.sort;
  const sortBy = getValidSortBy(sortFromUrl ?? prefsFromCookie.sort);
  const board = await api.boards.get({ slug });
  if (!board) {
    notFound();
  }

  const [discussions, rules, children] = await Promise.all([
    activeTab === "posts"
      ? api.discussions.list({
          board_id: board.id,
          board_child_id: childId || undefined,
          page: 1,
          per_page: 10,
          from: "board",
          sort: sortBy,
        })
      : Promise.resolve(null),
    // 只有在 rules tab 时才获取规则
    activeTab === "rules"
      ? api.boards.getRules({ board_id: board.id })
      : Promise.resolve(null),
    api.boards.getChildren(board.id).catch(() => ({ items: [] })),
  ]);

  return (
    <Suspense
      fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
    >
      <BoardDetail
        initialBoard={board}
        initialDiscussions={discussions}
        initialRules={rules}
        initialChildren={children.items}
        activeTab={activeTab}
        selectedChildId={childId}
        sortBy={sortBy}
      />
    </Suspense>
  );
}
