import { DiscussionsList } from "@/components/discussion/discussions-list";
import { api } from "@/lib/api";
import { getHomeMetadata } from "@/lib/metadata";
import { getDiscussionPreferencesFromCookie } from "@/lib/discussion-preferences-server";
import { DEFAULT_DISCUSSION_SORT } from "@/lib/discussion-preferences";
import { SortBy } from "@/types/display-preferences";

export const generateMetadata = () => {
  return getHomeMetadata();
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomePageData(sort: SortBy = DEFAULT_DISCUSSION_SORT) {
  try {
    const [discussionsResponse, stickyResponse] = await Promise.all([
      api.discussions.list({
        page: 1,
        per_page: 10,
        sort, // 使用用户偏好
      }),
      api.discussions.getSticky({}),
    ]);

    return {
      discussions: discussionsResponse,
      sticky: stickyResponse,
    };
  } catch (error) {
    console.error("获取首页数据失败:", error);
    // 返回默认空数据
    return {
      discussions: {
        code: -1,
        items: [],
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        message: error instanceof Error ? error.message : "获取数据失败",
      },
      sticky: [],
    };
  }
}

export default async function HomePage() {
  // 读取用户偏好
  const { sort, display } = getDiscussionPreferencesFromCookie();

  // 使用用户偏好获取数据
  const { discussions, sticky } = await getHomePageData(sort);

  return (
    <DiscussionsList
      initialDiscussions={discussions}
      from="index"
      sticky={sticky}
    />
  );
}
