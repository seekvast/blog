import { DiscussionsList } from "@/components/discussion/discussions-list";
import { api } from "@/lib/api";
import type { Pagination } from "@/types/common";
import type { Discussion } from "@/types/discussion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDiscussions(): Promise<Pagination<Discussion>> {
  try {
    const response = await api.discussions.list({
      page: 1,
      per_page: 10,
    });
    return response;
  } catch (error) {
    return {
      code: -1,
      items: [],
      total: 0,
      per_page: 10,
      current_page: 1,
      last_page: 1,
      message: error instanceof Error ? error.message : "获取数据失败",
    };
  }
}

export default async function HomePage() {
  const initialDiscussions = await getDiscussions();
  return (
    <DiscussionsList initialDiscussions={initialDiscussions} from="index" />
  );
}
