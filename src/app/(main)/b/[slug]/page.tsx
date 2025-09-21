import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import { BoardDetail } from "./board-detail";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getDiscussionPreferences } from "@/lib/discussion-preferences-server";
import {
  getValidSortBy,
  getValidDisplayMode,
} from "@/lib/discussion-preferences";

export const dynamic = 'force-dynamic';

interface BoardPageProps {
  params: { slug: string };
  searchParams: {
    tab?: string;
    child?: string;
    sort?: string;
    display?: string;
  };
}

export default async function BoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const { slug } = params;

  const activeTab = searchParams.tab || "posts";
  const childId = searchParams.child ? parseInt(searchParams.child, 10) : null;

  const pageId = "board-detail";

  const allPrefs = getDiscussionPreferences();
  const pagePrefs = allPrefs[pageId] || {};

  const sortBy = getValidSortBy(searchParams.sort ?? pagePrefs.sort);
  const displayMode = getValidDisplayMode(
    searchParams.display ?? pagePrefs.display
  );

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
        initDisplayMode={displayMode}
        pageId={pageId}
      />
    </Suspense>
  );
}
