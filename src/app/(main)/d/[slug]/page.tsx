import { Suspense } from "react";
import { DiscussionDetail } from "./discussion-detail";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

async function getDiscussion(slug: string, board_id: string) {
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

export default async function Page({ params, searchParams }: { params: { slug: string }, searchParams: { board_id: string } }) {
  const discussion = await getDiscussion(params.slug, searchParams.board_id);

  return (
    <AsyncBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <DiscussionDetail initialDiscussion={discussion} board_id={Number(searchParams.board_id)} />
      </Suspense>
    </AsyncBoundary>
  );
}
