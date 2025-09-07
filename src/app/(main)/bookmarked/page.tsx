import { DiscussionsList } from "@/components/discussion/discussions-list";
import { api } from "@/lib/api";
import { getBookmarksMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { getDiscussionPreferencesFromCookie } from "@/lib/discussion-preferences-server";

export const generateMetadata = () => {
  return getBookmarksMetadata();
};

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

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <LoginPrompt message="查看关注内容需要登录" />;
  }

  // 读取用户偏好
  const { sort, display } = getDiscussionPreferencesFromCookie();

  const initialDiscussions = await getDiscussions(sort);
  return (
    <DiscussionsList
      initialDiscussions={initialDiscussions}
      from="bookmarked"
      defaultSort={sort}
    />
  );
}
