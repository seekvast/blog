import { http } from "@/lib/request";
import { DiscussionsList } from "@/components/home/discussions-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDiscussions() {
  const response = await http.get("/api/discussions?page=1&per_page=10");
  if (response.code === 0) {
    return response.data.items;
  }
  throw new Error("Failed to fetch discussions");
}

export default async function HomePage() {
  const initialDiscussions = await getDiscussions();
  
  return (
    <div className="container max-w-4xl">
      <DiscussionsList initialDiscussions={initialDiscussions} />
    </div>
  );
}