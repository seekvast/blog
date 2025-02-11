'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { EditSubboardModal } from './edit-subboard-modal';
import { DeleteSubboardModal } from './delete-subboard-modal';

interface SubboardListProps {
  boardSlug: string;
}

export function SubboardList({ boardSlug }: SubboardListProps) {
  const [editingSubboard, setEditingSubboard] = useState<any>(null);
  const [deletingSubboard, setDeletingSubboard] = useState<any>(null);

  const { data: subboards, isLoading } = useQuery({
    queryKey: ['subboards', boardSlug],
    queryFn: () => api.boards.getSubboards({ slug: boardSlug }),
  });

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {subboards?.map((subboard: any) => (
        <div
          key={subboard.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <h3 className="font-medium">{subboard.name}</h3>
            <p className="text-sm text-muted-foreground">{subboard.description}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingSubboard(subboard)}>
                <Edit2 className="w-4 h-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingSubboard(subboard)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      <EditSubboardModal
        open={!!editingSubboard}
        onOpenChange={(open) => !open && setEditingSubboard(null)}
        subboard={editingSubboard}
        boardSlug={boardSlug}
      />

      <DeleteSubboardModal
        open={!!deletingSubboard}
        onOpenChange={(open) => !open && setDeletingSubboard(null)}
        subboard={deletingSubboard}
        boardSlug={boardSlug}
      />
    </div>
  );
}
