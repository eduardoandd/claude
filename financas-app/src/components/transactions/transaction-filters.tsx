"use client"

import { CATEGORIES } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthPicker } from "@/components/ui/month-picker"

interface TransactionFiltersProps {
  month: string
  type: string
  category: string
  onMonthChange: (v: string) => void
  onTypeChange: (v: string) => void
  onCategoryChange: (v: string) => void
}

const ALL_CATEGORIES = ["all", ...CATEGORIES.income, ...CATEGORIES.expense].filter(
  (v, i, a) => a.indexOf(v) === i
)

export function TransactionFilters({
  month,
  type,
  category,
  onMonthChange,
  onTypeChange,
  onCategoryChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <MonthPicker value={month} onChange={onMonthChange} />

      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {CATEGORIES.income.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
          {CATEGORIES.expense.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
