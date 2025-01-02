import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 模拟板块数据
const BOARDS = [
  { id: 1, name: "问答", icon: "❓" },
  { id: 2, name: "分享", icon: "📝" },
  { id: 3, name: "讨论", icon: "💬" },
  { id: 4, name: "建议", icon: "💡" },
]

interface BoardSelectProps {
  value?: number
  onChange?: (value: number) => void
}

export function BoardSelect({ value, onChange }: BoardSelectProps) {
  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => onChange?.(Number(value))}
    >
      <SelectTrigger>
        <SelectValue placeholder="选择板块" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {BOARDS.map((board) => (
            <SelectItem key={board.id} value={board.id.toString()}>
              <span className="flex items-center gap-2">
                <span>{board.icon}</span>
                <span>{board.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
