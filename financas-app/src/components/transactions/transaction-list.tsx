"use client"

import { Transaction } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhuma transação encontrada.</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                t.type === "income" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{t.description || t.category}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(t.date)} · {t.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span
              className={`text-sm font-semibold ${
                t.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
            </span>
            <Badge variant={t.type === "income" ? "income" : "expense"} className="hidden sm:inline-flex">
              {t.type === "income" ? "Receita" : "Despesa"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(t)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(t.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
