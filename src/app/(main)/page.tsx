import { discussionService } from "@/services/discussion";
import { DiscussionsList } from "@/components/home/discussions-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDiscussions() {
  try {
    const response = await discussionService.getDiscussions({ 
      page: 1, 
      per_page: 10 
    });

    if (response.code === 0) {
      return response.data.items;
    }
    
    // console.error("Failed to fetch discussions:", response);
    return [];
  } catch (error) {
    // console.error("Error fetching discussions:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialDiscussions = await getDiscussions();
  
  return <DiscussionsList initialDiscussions={initialDiscussions} />;
}