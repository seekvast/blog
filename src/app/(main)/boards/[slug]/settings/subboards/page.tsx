'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubboardList } from './components/subboard-list';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { CreateSubboardModal } from './components/create-subboard-modal';

export default function SubboardsPage() {
  const params = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">子版块管理</h2>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          新增子版块
        </Button>
      </div>

      <SubboardList boardSlug={params.slug as string} />

      <CreateSubboardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        boardSlug={params.slug as string}
      />
    </Card>
  );
}
