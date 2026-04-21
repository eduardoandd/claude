"use client"

import { useState } from "react"
import { MonthlySummary } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownCircle, ArrowUpCircle, Wallet, Sparkles } from "lucide-react"
import { AnalysisModal, DashboardAnalysisContext, CardType } from "./analysis-modal"

interface SummaryCardsProps {
  summary: MonthlySummary
  context: DashboardAnalysisContext
}

export function SummaryCards({ summary, context }: SummaryCardsProps) {
  const [activeModal, setActiveModal] = useState<CardType | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Total do mês</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                onClick={() => setActiveModal("income")}
              >
                <Sparkles className="h-3 w-3" />
                Analisar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Total do mês</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                onClick={() => setActiveModal("expenses")}
              >
                <Sparkles className="h-3 w-3" />
                Analisar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.balance)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Receitas − Despesas</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                onClick={() => setActiveModal("balance")}
              >
                <Sparkles className="h-3 w-3" />
                Analisar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeModal && (
        <AnalysisModal
          open={true}
          onClose={() => setActiveModal(null)}
          cardType={activeModal}
          title={
            activeModal === "income" ? "Receitas" :
            activeModal === "expenses" ? "Despesas" : "Saldo"
          }
          context={context}
        />
      )}
    </>
  )
}
