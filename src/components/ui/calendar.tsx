"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { zhTW } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      locale={zhTW}
      weekStartsOn={1}
      classNames={{
        root: "w-full px-6 py-4",
        months: "flex flex-col",
        month: "space-y-6",
        caption: "flex justify-between items-center mb-4",
        caption_label: "text-xl font-semibold",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 text-blue-600 hover:text-blue-800 flex items-center justify-center"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 mb-1",
        head_cell: "text-center text-sm font-normal text-neutral-600",
        row: "grid grid-cols-7 mt-2",
        cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal mx-auto flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
        day_today: "text-blue-600 font-semibold",
        day_outside: "text-neutral-400 opacity-50",
        day_disabled: "text-neutral-400 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-6 w-6" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-6 w-6" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
