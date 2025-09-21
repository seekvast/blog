import { getDiscussionPreferences } from "@/lib/discussion-preferences-server";
import {
  getValidSortBy,
  getValidDisplayMode,
} from "@/lib/discussion-preferences";
import { api } from "@/lib/api";
import { ExploreDiscussionsClient } from "./client";

export const dynamic = "force-dynamic";

interface ExploreDiscussionsPageProps {
  searchParams: {
    q?: string;
    sort?: string;
    display?: string;
  };
}

export default async function ExploreDiscussionsPage({
  searchParams,
}: ExploreDiscussionsPageProps) {
  const pageId = "search";
  const q = searchParams.q ?? "";

  const allPrefs = getDiscussionPreferences();
  const pagePrefs = allPrefs[pageId] || {};

  const sortBy = getValidSortBy(searchParams.sort ?? pagePrefs.sort);
  const displayMode = getValidDisplayMode(
    searchParams.display ?? pagePrefs.display
  );

  const initialDiscussions = q
    ? await api.discussions.list({
        from: "search",
        keyword: q,
        page: 1,
        sort: sortBy,
      })
    : null;

  return (
    <ExploreDiscussionsClient
      query={q}
      pageId={pageId}
      initialDiscussions={initialDiscussions}
      sortBy={sortBy}
      initialDisplayMode={displayMode}
    />
  );
}
