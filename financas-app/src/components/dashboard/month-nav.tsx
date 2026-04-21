"use client"

import { useRouter } from "next/navigation"
import { MonthPicker } from "@/components/ui/month-picker"

export function MonthNav({ currentMonth }: { currentMonth: string }) {
  const router = useRouter()

  return (
    <MonthPicker
      value={currentMonth}
      onChange={(m) => router.push(`?month=${m}`)}
    />
  )
}
