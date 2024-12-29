// "use client"

// import * as React from "react"
// import { zhTW } from "date-fns/locale"
// import { format } from "date-fns"
// import { Calendar as CalendarIcon } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// // import Calendar from "@/components/ui/calendar"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// interface DatePickerProps {
//   date?: Date
//   onSelect?: (date: Date | undefined) => void
// }

// export function DatePicker({ date, onSelect }: DatePickerProps) {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             "w-full h-12 justify-start text-left font-normal",
//             !date && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, "yyyy年MM月dd日", { locale: zhTW }) : <span>請選擇生日</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[360px] p-0 rounded-xl" align="start">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={onSelect}
//           locale={zhTW}
//           fromYear={1900}
//           toYear={new Date().getFullYear()}
//           disabled={(date) => date > new Date()}
//           ISOWeek
//         />
//       </PopoverContent>
//     </Popover>
//   )
// }
