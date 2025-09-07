
import { DiscussionsList } from "@/components/discussion/discussions-list";
import { api } from "@/lib/api";
import { getHomeMetadata } from "@/lib/metadata";
import { getValidSortBy } from "@/lib/discussion-preferences";
import { SortBy } from "@/types/display-preferences";

export const generateMetadata = () => getHomeMetadata();
export const revalidate = 60;

interface HomePageProps {
  searchParams: {
    sort?: string;
  };
}

async function getHomePageData(sortBy: SortBy) {
  try {
    const [discussionsResponse, stickyResponse] = await Promise.all([
      api.discussions.list({
        page: 1,
        per_page: 10,
        sort: sortBy,
      }),
      api.discussions.getSticky({}),
    ]);
    return { discussions: discussionsResponse, sticky: stickyResponse };
  } catch (error) {
    console.error("Failed to get homepage data:", error);
    return {
      discussions: {
        code: -1, items: [], total: 0, per_page: 10,
        current_page: 1, last_page: 1, message: "Failed to fetch data.",
      },
      sticky: [],
    };
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sortBy = getValidSortBy(searchParams.sort)

  const { discussions, sticky } = await getHomePageData(sortBy);

  return (
    <DiscussionsList
      initialDiscussions={discussions}
      sortBy={sortBy}
      sticky={sticky}
      from="index" 
    />
  );
}