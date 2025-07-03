import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BoardSettingsForm } from "./board-settings-form";
import { api } from "@/lib/api";
import { BoardUserRole } from "@/constants/board-user-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROLE_PERMISSIONS } from "@/constants/board-permissions";
import { BoardPermission } from "@/constants/board-permissions";

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
  const userRole = board.board_user?.user_role;
  if (!userRole || !ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]) {
    notFound();
  }
  const hasSettingsPermission = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS].includes(BoardPermission.VISIT_SETTINGS);
  if (!hasSettingsPermission) {
    notFound();
  }


  return (
    <div className="pt-2">
      {/* <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <div className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap">
              <span>{boardTypeMap[board.visibility] ?? '未知'}</span>
              <span className="mx-1.5">·</span>
              <span>{board.users_count} 成員</span>
              {board.category && (
                <>
                  <span className="mx-1.5">·</span>
                  <span>{board.category.name}</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {board.desc}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" asChild>
            <Link href={`/b/${board.slug}`}>您的看板</Link>
          </Button>
        </div>
      </div> */}

      {/* <hr className="my-4" /> */}

      <BoardSettingsForm board={board} />
    </div>
  );
}
