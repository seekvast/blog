import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BoardSettingsForm } from "./board-settings-form";
import { api } from "@/lib/api";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BoardSettingsPage({ params }: PageProps) {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    notFound();
  }

  const board = await api.boards.get({ slug });
  if (!board) {
    notFound();
  }

  return <BoardSettingsForm board={board} />;
}
