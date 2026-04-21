"use client"

import { useState } from "react"
import { Transaction } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { AnalysisModal, DashboardAnalysisContext } from "./analysis-modal"

interface RecentTransactionsProps {
  transactions: Transaction[]
  context: DashboardAnalysisContext
}

export function RecentTransactions({ transactions, context }: RecentTransactionsProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Transações recentes</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
              onClick={() => setModalOpen(true)}
            >
              <Sparkles className="h-3 w-3" />
              Analisar
            </Button>
            <Link
              href="/transactions"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma transação ainda.
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        t.type === "income" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold shrink-0 ml-2 ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnalysisModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cardType="recent"
        title="Transações Recentes"
        context={context}
      />
    </>
  )
}
