import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { useTaxonomyStore, selectCategoriesByParentId } from '@/store'
import type { Category } from '@/types'

interface CategoryTreeProps {
  category?: Category
  level?: number
  selectedId?: number
  onSelect?: (category: Category) => void
}

export function CategoryTree({
  category,
  level = 0,
  selectedId,
  onSelect
}: CategoryTreeProps) {
  const childCategories = useTaxonomyStore(
    selectCategoriesByParentId(category?.id ?? null)
  )

  if (childCategories.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-1', level > 0 && 'ml-4')}>
      {childCategories.map(child => (
        <CategoryTreeItem
          key={child.id}
          category={child}
          level={level}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface CategoryTreeItemProps {
  category: Category
  level: number
  selectedId?: number
  onSelect?: (category: Category) => void
}

function CategoryTreeItem({
  category,
  level,
  selectedId,
  onSelect
}: CategoryTreeItemProps) {
  const childCategories = useTaxonomyStore(
    selectCategoriesByParentId(category.id)
  )

  const hasChildren = childCategories.length > 0

  if (!hasChildren) {
    return (
      <div
        className={cn(
          'flex cursor-pointer items-center rounded-lg px-2 py-1.5 text-sm hover:bg-accent',
          selectedId === category.id && 'bg-accent'
        )}
        onClick={() => onSelect?.(category)}
      >
        <span className="ml-6">{category.name}</span>
      </div>
    )
  }

  return (
    <Collapsible>
      <CollapsibleTrigger
        className={cn(
          'flex w-full cursor-pointer items-center rounded-lg px-2 py-1.5 text-sm hover:bg-accent',
          selectedId === category.id && 'bg-accent'
        )}
        onClick={() => onSelect?.(category)}
      >
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
        <span className="ml-2">{category.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CategoryTree
          category={category}
          level={level + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
