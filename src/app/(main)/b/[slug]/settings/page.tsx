import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BoardSettingsForm } from "./board-settings-form";
import { api } from "@/lib/api";
import { BoardUserRole } from "@/constants/board-user-role";

export const dynamic = "force-dynamic";

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
  const acceptRole = [BoardUserRole.CREATOR, BoardUserRole.MODERATOR];
  if (
    !board.board_user ||
    !acceptRole.includes(
      board.board_user.user_role as (typeof acceptRole)[number]
    )
  ) {
    notFound();
  }
  return <BoardSettingsForm board={board} />;
}
