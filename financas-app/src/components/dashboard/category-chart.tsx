"use client"

import { useState } from "react"
import { CategoryExpense } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { AnalysisModal, DashboardAnalysisContext } from "./analysis-modal"

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
]

interface CategoryChartProps {
  data: CategoryExpense[]
  context: DashboardAnalysisContext
}

export function CategoryChart({ data, context }: CategoryChartProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
            onClick={() => setModalOpen(true)}
          >
            <Sparkles className="h-3 w-3" />
            Analisar
          </Button>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Nenhuma despesa neste período
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, payload }) =>
                      `${name} (${(payload as { percentage?: number })?.percentage?.toFixed(0) ?? 0}%)`
                    }
                    labelLine={false}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {data.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                      <span className="text-muted-foreground text-xs">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AnalysisModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cardType="categories"
        title="Despesas por Categoria"
        context={context}
      />
    </>
  )
}
