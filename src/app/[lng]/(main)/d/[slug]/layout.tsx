import { getPostMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata | null> {
  try {
    const discussion = await api.discussions.get(params.slug);
    const board = discussion.board;
    
    return getPostMetadata(
      {
        title: discussion.title,
        content: discussion.main_post?.content || "",
        cover_image: discussion.main_post?.content.match(/!\[.*?\]\((.*?)\)/)?.[1]
      },
      board
    );
  } catch (error) {
    return null;
  }
}

export default function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
