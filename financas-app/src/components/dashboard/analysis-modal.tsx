"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MonthlySummary, CategoryExpense, Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Send, Sparkles, TrendingUp, TrendingDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export type CardType = "income" | "expenses" | "balance" | "categories" | "recent"

export interface DashboardAnalysisContext {
  summary: MonthlySummary
  categories: CategoryExpense[]
  transactions: Transaction[]
  month: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface AnalysisModalProps {
  open: boolean
  onClose: () => void
  cardType: CardType
  title: string
  context: DashboardAnalysisContext
}

const INITIAL_PROMPTS: Record<CardType, string> = {
  income:
    "Analise minhas receitas deste mês. Avalie a diversificação das fontes, identifique padrões e sugira como melhorar minha renda.",
  expenses:
    "Analise minhas despesas deste mês. Identifique os maiores gastos, aponte onde posso economizar e dê alertas importantes.",
  balance:
    "Analise meu equilíbrio financeiro deste mês. Avalie minha taxa de economia, compare receitas e despesas, e dê recomendações práticas.",
  categories:
    "Analise a distribuição das minhas despesas por categoria. Identifique o que está acima do ideal e sugira otimizações.",
  recent:
    "Analise minhas transações recentes. Identifique padrões de comportamento financeiro e destaque pontos de atenção.",
}

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#84cc16",
]

// ── Left panel: card-specific visualization ──────────────────────────────────

function IncomePanel({ context }: { context: DashboardAnalysisContext }) {
  const { summary, transactions } = context
  const incomeList = transactions.filter((t) => t.type === "income").sort((a, b) => b.amount - a.amount)
  const savingsRate = summary.totalIncome > 0 ? (summary.balance / summary.totalIncome) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Receitas</p>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Taxa de economia</span>
          <span className={savingsRate >= 0 ? "text-green-600" : "text-red-500"}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${savingsRate >= 0 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Entradas ({incomeList.length})
        </p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {incomeList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sem receitas no período</p>
          ) : (
            incomeList.map((t) => (
              <div key={t.id} className="flex justify-between items-center text-xs gap-2">
                <span className="truncate text-muted-foreground flex-1" title={t.description || t.category}>
                  {t.description || t.category}
                </span>
                <span className="text-green-600 font-medium shrink-0">{formatCurrency(t.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ExpensesPanel({ context }: { context: DashboardAnalysisContext }) {
  const { summary, categories } = context
  const spendRate =
    summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 : 100
  const top5 = categories.slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Despesas</p>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
        {summary.totalIncome > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {spendRate.toFixed(1)}% da renda
          </p>
        )}
      </div>

      {top5.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Top categorias</p>
          <div className="space-y-2">
            {top5.map((cat, i) => (
              <div key={cat.category} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{cat.category}</span>
                  <span className="font-medium">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BalancePanel({ context }: { context: DashboardAnalysisContext }) {
  const { summary } = context
  const savingsRate =
    summary.totalIncome > 0 ? (summary.balance / summary.totalIncome) * 100 : 0
  const barData = [
    { name: "Receitas", value: summary.totalIncome },
    { name: "Despesas", value: summary.totalExpenses },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Saldo</p>
        <p
          className={`text-3xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {formatCurrency(summary.balance)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={barData} barSize={40}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {barData.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Taxa de economia</span>
          <span className={savingsRate >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${savingsRate >= 0 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {savingsRate >= 20
            ? "Ótima taxa! Continue assim."
            : savingsRate >= 10
            ? "Taxa razoável. Tente chegar a 20%."
            : savingsRate >= 0
            ? "Taxa baixa. Meta: 20% da renda."
            : "Gastos maiores que receitas!"}
        </p>
      </div>
    </div>
  )
}

function CategoriesPanel({ context }: { context: DashboardAnalysisContext }) {
  const { categories } = context
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma despesa no período
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={75} innerRadius={30}>
            {categories.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {categories.map((cat, i) => (
          <div key={cat.category} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 text-muted-foreground truncate">{cat.category}</span>
            <span className="font-medium shrink-0">{formatCurrency(cat.amount)}</span>
            <span className="text-muted-foreground shrink-0">{cat.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentPanel({ context }: { context: DashboardAnalysisContext }) {
  const { transactions, summary } = context
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-2 text-center">
          <TrendingUp className="h-3.5 w-3.5 text-green-500 mx-auto mb-0.5" />
          <p className="text-xs text-muted-foreground">Receitas</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2 text-center">
          <TrendingDown className="h-3.5 w-3.5 text-red-500 mx-auto mb-0.5" />
          <p className="text-xs text-muted-foreground">Despesas</p>
          <p className="text-sm font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Transações ({sorted.length})
        </p>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              <div
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  t.type === "income" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="flex-1 truncate text-muted-foreground" title={t.description || t.category}>
                {t.description || t.category}
              </span>
              <span
                className={`font-medium shrink-0 ${
                  t.type === "income" ? "text-green-600" : "text-red-500"
                }`}
              >
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LEFT_PANELS: Record<CardType, React.ComponentType<{ context: DashboardAnalysisContext }>> = {
  income: IncomePanel,
  expenses: ExpensesPanel,
  balance: BalancePanel,
  categories: CategoriesPanel,
  recent: RecentPanel,
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function AnalysisModal({ open, onClose, cardType, title, context }: AnalysisModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasTriggered = useRef(false)
  const streamBufferRef = useRef("")
  const streamDoneRef = useRef(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!open) {
      setMessages([])
      setInput("")
      setStreaming(false)
      hasTriggered.current = false
      stopTypewriter()
    }
  }, [open])

  useEffect(() => {
    return () => stopTypewriter()
  }, [])

  useEffect(() => {
    if (open && !hasTriggered.current) {
      hasTriggered.current = true
      sendMessage(INITIAL_PROMPTS[cardType], [])
    }
  }, [open, cardType])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function stopTypewriter() {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
  }

  function startTypewriter(msgIndex: number) {
    let displayed = 0
    typewriterRef.current = setInterval(() => {
      const buffer = streamBufferRef.current
      const done = streamDoneRef.current
      if (displayed >= buffer.length) {
        if (done) stopTypewriter()
        return
      }
      const step = 4
      const next = buffer.slice(0, displayed + step)
      displayed = next.length
      setMessages((prev) => {
        const msgs = [...prev]
        if (msgs[msgIndex]) msgs[msgIndex] = { ...msgs[msgIndex], content: next }
        return msgs
      })
    }, 18)
  }

  async function sendMessage(content: string, history: ChatMessage[]) {
    if (streaming) return
    setStreaming(true)
    stopTypewriter()
    streamBufferRef.current = ""
    streamDoneRef.current = false

    const userMsg: ChatMessage = { role: "user", content }
    const next = [...history, userMsg]
    const msgIndex = next.length
    setMessages([...next, { role: "assistant", content: "" }])
    setInput("")

    startTypewriter(msgIndex)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardType,
          data: {
            summary: context.summary,
            categories: context.categories,
            transactions: context.transactions,
            month: context.month,
          },
          messages: next,
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        streamBufferRef.current += decoder.decode(value, { stream: true })
      }
    } catch {
      stopTypewriter()
      setMessages((prev) => {
        const msgs = [...prev]
        if (msgs[msgIndex]) {
          msgs[msgIndex] = {
            role: "assistant",
            content: "Erro ao gerar análise. Verifique se a ANTHROPIC_API_KEY está configurada.",
          }
        }
        return msgs
      })
    } finally {
      streamDoneRef.current = true
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || streaming) return
    sendMessage(trimmed, messages.filter((m) => !(m.role === "assistant" && m.content === "")))
  }

  const LeftPanel = LEFT_PANELS[cardType]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Análise IA — {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: rich visualization */}
          <div className="w-72 shrink-0 border-r overflow-y-auto p-4">
            <LeftPanel context={context} />
          </div>

          {/* Right: streaming chat */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.role === "user" ? "EU" : "IA"}
                  </div>
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-sm max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60"
                    } ${msg.content === "" ? "animate-pulse bg-muted/40 h-8 w-32" : ""}`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-base font-bold mb-1 mt-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1.5">{children}</h3>,
                          code: ({ children }) => <code className="bg-background/50 rounded px-1 text-xs font-mono">{children}</code>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-muted-foreground/40 pl-3 italic">{children}</blockquote>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="shrink-0 px-4 pb-4 pt-2 border-t flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Faça uma pergunta sobre seus dados..."
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                disabled={streaming}
              />
              <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
