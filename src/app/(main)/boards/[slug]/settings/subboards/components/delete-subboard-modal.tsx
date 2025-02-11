'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteSubboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subboard: any;
  boardSlug: string;
}

export function DeleteSubboardModal({
  open,
  onOpenChange,
  subboard,
  boardSlug,
}: DeleteSubboardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.boards.deleteSubboard({
        boardSlug,
        subboardId: subboard.id,
      });

      toast.success('子版块删除成功');
      queryClient.invalidateQueries(['subboards', boardSlug]);
      onOpenChange(false);
    } catch (error) {
      toast.error('删除失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!subboard) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除子版块</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除子版块 &quot;{subboard.name}&quot; 吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? '删除中...' : '删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
