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
  console.log("settings.....................");
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    notFound();
  }

  // 在服务端直接获取数据
  const board = await api.boards.get({ slug });
  console.log(board, "bo..........");
  if (!board) {
    notFound();
  }

  return <BoardSettingsForm board={board} />;
}
