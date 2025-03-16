import { DiscussionsList } from "@/components/home/discussions-list";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDiscussions() {
  try {
    const response = await api.discussions.list({ 
      page: 1, 
      per_page: 10,
      from: 'following'
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
      message: error instanceof Error ? error.message : 'Failed to fetch discussions'
    };
  }
}

export default async function HomePage() {
  const initialDiscussions = await getDiscussions();
  return <DiscussionsList initialDiscussions={initialDiscussions} from="following" />;
}