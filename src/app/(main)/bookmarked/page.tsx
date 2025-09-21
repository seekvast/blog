import { DiscussionsList } from "@/components/discussion/discussions-list";
import { api } from "@/lib/api";
import { getBookmarksMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { getDiscussionPreferences } from "@/lib/discussion-preferences-server";
import {
  getValidSortBy,
  getValidDisplayMode,
} from "@/lib/discussion-preferences";

export const generateMetadata = () => {
  return getBookmarksMetadata();
};

interface PageProps {
  searchParams: {
    sort?: string;
    display?: string;
  };
}

async function getDiscussions(sort?: string) {
  try {
    const response = await api.discussions.list({
      page: 1,
      per_page: 10,
      from: "bookmarked",
      sort,
    });
    return response;
  } catch (error) {
    // Return an empty paginated result in case of error
    return {
      code: -1,
      items: [],
      total: 0,
      per_page: 10,
      current_page: 1,
      last_page: 1,
      message:
        error instanceof Error ? error.message : "Failed to fetch discussions",
    };
  }
}

export default async function BookmarkedPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <LoginPrompt message="查看关注内容需要登录" />;
  }

  const pageId = "bookmarked";
  const allPrefs = getDiscussionPreferences();
  const pagePrefs = allPrefs[pageId] || {};
  const sortBy = getValidSortBy(searchParams.sort ?? pagePrefs.sort);
  const displayMode = getValidDisplayMode(
    searchParams.display ?? pagePrefs.display
  );

  const initialDiscussions = await getDiscussions(sortBy);
  return (
    <DiscussionsList
      initialDiscussions={initialDiscussions}
      from="bookmarked"
      sortBy={sortBy}
      initDisplayMode={displayMode}
      pageId={pageId}
    />
  );
}
