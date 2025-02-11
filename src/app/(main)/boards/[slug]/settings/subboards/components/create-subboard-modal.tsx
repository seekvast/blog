'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateSubboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSlug: string;
}

export function CreateSubboardModal({
  open,
  onOpenChange,
  boardSlug,
}: CreateSubboardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await api.boards.createSubboard({
        boardSlug,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });

      toast.success('子版块创建成功');
      queryClient.invalidateQueries(['subboards', boardSlug]);
      onOpenChange(false);
    } catch (error) {
      toast.error('创建失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增子版块</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              name="name"
              placeholder="请输入子版块名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="请输入子版块描述"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
