"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VotersList } from "@/components/post/voters-list";
import { useTranslationFixed } from "@/hooks/use-translation-fixed";

export function VotersListModal({
  postId,
  children,
}: {
  postId: number;
  children: ReactNode;
}) {
  const { t } = useTranslationFixed();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="p-4 pb-0"></DialogHeader>
        <div className="h-[400px]">
          <VotersList postId={postId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
