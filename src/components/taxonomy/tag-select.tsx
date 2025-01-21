import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useTaxonomyStore, selectTags } from '@/store'
import type { Tag } from '@/types'

interface TagSelectProps {
  value?: number[]
  onChange?: (value: number[]) => void
  max?: number
}

export function TagSelect({ value = [], onChange, max = 5 }: TagSelectProps) {
  const tags = useTaxonomyStore(selectTags)
  const selectedTags = tags.filter(tag => value.includes(tag.id))

  const handleSelect = (tagId: number) => {
    if (value.includes(tagId)) {
      onChange?.(value.filter(id => id !== tagId))
    } else if (value.length < max) {
      onChange?.([...value, tagId])
    }
  }

  const handleRemove = (tagId: number) => {
    onChange?.(value.filter(id => id !== tagId))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => handleRemove(tag.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      {value.length < max && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-dashed"
            >
              添加标签
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="搜索标签..." />
              <CommandEmpty>未找到标签</CommandEmpty>
              <CommandGroup>
                {tags
                  .filter(tag => !value.includes(tag.id))
                  .map(tag => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag.id)}
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
