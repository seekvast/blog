// 我是 Linus。看看一个简洁的页面应该是什么样。

import { DiscussionsList } from "@/components/discussion/discussions-list";

import { api } from "@/lib/api";
import { getHomeMetadata } from "@/lib/metadata";
import { DEFAULT_DISCUSSION_SORT } from "@/lib/discussion-preferences";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";

export const generateMetadata = () => {
  return getHomeMetadata();
};

export const revalidate = 60;

const defaultDiscussions: Pagination<Discussion> = {
  code: -1,
  items: [],
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  message: "Failed to fetch data.",
};

async function getHomePageData() {
  try {
    const [discussionsResponse, stickyResponse] = await Promise.all([
      api.discussions.list({
        page: 1,
        per_page: 10,
        sort: DEFAULT_DISCUSSION_SORT,
      }),
      api.discussions.getSticky({}),
    ]);

    return {
      discussions: discussionsResponse,
      sticky: stickyResponse,
    };
  } catch (error) {
    console.error("Failed to get homepage data:", error);
    return {
      discussions: defaultDiscussions,
      sticky: [],
    };
  }
}

export default async function HomePage() {
  const { discussions, sticky } = await getHomePageData();

  return (
    <DiscussionsList
      initialDiscussions={discussions}
      from="index"
      sticky={sticky}
      defaultSort={DEFAULT_DISCUSSION_SORT}
    />
  );
}
