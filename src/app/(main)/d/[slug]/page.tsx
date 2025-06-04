import { Suspense } from "react";
import { DiscussionDetail } from "./discussion-detail";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Loading } from "@/components/ui/loading";

export const dynamic = "force-dynamic";

async function getDiscussion(slug: string) {
  const response = await api.discussions.get(slug);
  if (!response) {
    notFound();
  }
  return response;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const discussion = await getDiscussion(params.slug);

  return (
    <AsyncBoundary>
      <Suspense
        fallback={
          <div className="text-center py-8">
            <Loading size="md" />
          </div>
        }
      >
        <DiscussionDetail initialDiscussion={discussion} />
      </Suspense>
    </AsyncBoundary>
  );
}
