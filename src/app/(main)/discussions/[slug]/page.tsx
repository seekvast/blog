import { Suspense } from "react";
import { discussionService } from "@/services/discussion";
import { DiscussionDetail } from "./discussion-detail";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

async function getDiscussion(slug: string) {
  try {
    const response = await api.discussions.get(slug);
    return response;
  } catch (error: any) {
    if (error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const discussion = await getDiscussion(params.slug);

  return (
    <AsyncBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <DiscussionDetail initialDiscussion={discussion} />
      </Suspense>
    </AsyncBoundary>
  );
}
