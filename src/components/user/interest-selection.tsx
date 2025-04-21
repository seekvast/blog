"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/common";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon } from "lucide-react";

interface InterestSelectionProps {
  onComplete?: () => void;
  className?: string;
}

export function InterestSelection({
  onComplete,
  className = "",
}: InterestSelectionProps) {
  const [categories, setCategories] = useState<
    Array<Category & { selected: boolean }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // 获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.common.categories();
      setCategories(response.map((cat) => ({ ...cat, selected: false })));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "获取分类失败",
        description: error instanceof Error ? error.message : "发生未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const selectedIds = categories
        .filter((cat) => cat.selected)
        .map((cat) => cat.id);

      await api.users.saveCategory({
        category_id: selectedIds.length > 0 ? selectedIds : undefined,
      });

      toast({
        title: "保存成功",
        description: "您的兴趣已保存",
      });

      if (onComplete) onComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : "发生未知错误",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-xl font-semibold">选择您感兴趣的话题</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">选择您感兴趣的话题</h2>
      <p className="text-sm text-neutral-500">
        选择您感兴趣的话题，我们将为您推荐相关内容
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`
              p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center
              ${
                category.selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 hover:border-neutral-300"
              }
            `}
          >
            <p className="text-sm font-medium truncate">{category.name}</p>
            {category.selected && (
              <CheckIcon className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isSaving} className="w-[120px]">
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
