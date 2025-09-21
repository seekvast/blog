import { api } from "@/lib/api";
import { BoardList } from "@/components/board/board-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kater-Boards",
  description: "Find and explore various boards.",
};

interface BoardsPageProps {
  searchParams: {
    tab?: "recommended" | "subscribed";
    category?: string;
  };
}

export default async function BoardsPage({ searchParams }: BoardsPageProps) {
  const activeTab = searchParams.tab || "recommended";
  const categoryFilter = searchParams.category
    ? Number(searchParams.category)
    : null;

  const categoriesPromise = api.common.categories();
  const initialBoardsPromise = api.boards.list({
    page: 1,
    per_page: 20,
    q: activeTab,
    ...(categoryFilter && { category_id: categoryFilter }),
  });

  const [categories, initialBoardsData] = await Promise.all([
    categoriesPromise,
    initialBoardsPromise,
  ]);

  return (
    <div className="flex flex-col">
      <Suspense fallback={<BoardPageSkeleton />}>
        <BoardList
          initialPage={initialBoardsData}
          categories={categories}
          activeTab={activeTab}
          categoryFilter={categoryFilter}
        />
      </Suspense>
    </div>
  );
}

function BoardPageSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="bg-background">
        <div className="mx-auto w-full">
          <div className="flex h-[40px] items-center justify-between relative lg:px-6 lg:border-b">
            <div className="flex items-center space-x-8 relative">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full divide-y lg:px-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-4 flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
