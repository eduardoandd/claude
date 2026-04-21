"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthPickerProps {
  value: string // "yyyy-MM"
  onChange: (value: string) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value.split("-").map(Number)

  const label = new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  function navigate(delta: number) {
    const d = new Date(year, month - 1 + delta)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    onChange(`${y}-${m}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background px-1 py-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md"
        onClick={() => navigate(-1)}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="w-36 text-center text-sm font-medium capitalize select-none">
        {label}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md"
        onClick={() => navigate(1)}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
