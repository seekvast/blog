"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/common";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon } from "lucide-react";
import Twemoji from "react-twemoji";
import { useAuth } from "@/components/providers/auth-provider";

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

  useEffect(() => {
    fetchCategoriesAndUserSelections();
  }, []);

  const { user } = useAuth();

  const fetchCategoriesAndUserSelections = async () => {
    try {
      setIsLoading(true);

      const allCategories = await api.common.categories();

      if (user) {
        const userInfo = await api.users.get({ username: user.username });

        const userSelectedIds =
          userInfo.categories?.map((cat: Category) => cat.id) || [];

        setCategories(
          allCategories.map((cat) => ({
            ...cat,
            selected: userSelectedIds.includes(cat.id),
          }))
        );
      } else {
        setCategories(
          allCategories.map((cat) => ({
            ...cat,
            selected: false,
          }))
        );
      }
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

  const selectedCount = categories.filter((cat) => cat.selected).length;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <p className="text-sm text-neutral-500">根据你的选择推荐相应的内容</p>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-neutral-500">根据你的选择推荐相应的内容</p>

      <div className="grid grid-cols-3 gap-3 my-4">
        {categories.map((category) => (
          <div key={category.id} className="flex justify-center">
            <div
              onClick={() => toggleCategory(category.id)}
              className={`
                relative py-2 px-3 rounded-full cursor-pointer transition-all flex items-center
                ${category.selected ? "bg-primary text-white" : "bg-subtle"}
              `}
            >
              {!category.selected && (
                <span className="text-base mr-1.5">
                  <Twemoji options={{ className: "w-6 h-6" }}>
                    {category.icon}
                  </Twemoji>
                </span>
              )}
              <p className="text-sm font-medium">{category.name}</p>
              {category.selected && (
                <div className="ml-auto">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 w-full">
        {selectedCount > 0 ? (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 text-base font-medium rounded-lg bg-primary hover:bg-primary/90"
          >
            {isSaving ? "保存中..." : `已选 ${selectedCount} 个，选好了`}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSkip}
            className="w-full h-12 text-base font-medium rounded-lg text-neutral-400 border-neutral-200"
          >
            选好了
          </Button>
        )}
      </div>
    </div>
  );
}
