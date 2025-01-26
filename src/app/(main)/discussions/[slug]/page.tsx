import { Suspense } from "react";
import { discussionService } from "@/services/discussion";
import { DiscussionDetail } from "./discussion-detail";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

async function getDiscussion(slug: string) {
  try {
      const response = await api.discussions.get(slug);
    console.log(response, "--------------------detail");
    return response;
  } catch (error: any) {
    console.log(error, "--------------------detail");
    if (error.status === 404) {
      notFound();
    }
    throw error; // 其他错误继续抛出
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
