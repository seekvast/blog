import { getBoardMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata | null> {
  try {
    const board = await api.boards.get({ slug: params.slug });
    return getBoardMetadata(board);
  } catch (error) {
    return null;
  }
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
