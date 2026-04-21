import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Transaction, MonthlySummary, CategoryExpense } from "@/types"
import { DashboardAnalysisContext } from "@/components/dashboard/analysis-modal"
import { MonthNav } from "@/components/dashboard/month-nav"
import { format } from "date-fns"

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const params = await searchParams
  const currentMonth = params.month || format(new Date(), "yyyy-MM")
  const [year, month] = currentMonth.split("-")
  const startDate = `${year}-${month}-01`
  const lastDay = new Date(Number(year), Number(month), 0).getDate()
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  const txList = (transactions ?? []) as Transaction[]

  const summary: MonthlySummary = txList.reduce(
    (acc, t) => {
      if (t.type === "income") acc.totalIncome += t.amount
      else acc.totalExpenses += t.amount
      return acc
    },
    { totalIncome: 0, totalExpenses: 0, balance: 0 }
  )
  summary.balance = summary.totalIncome - summary.totalExpenses

  const expensesByCategory = txList
    .filter((t) => t.type === "expense")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const categoryData: CategoryExpense[] = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const recentTransactions = txList.slice(0, 5)

  const analysisContext: DashboardAnalysisContext = {
    summary,
    categories: categoryData,
    transactions: txList,
    month: currentMonth,
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={user.email} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Resumo financeiro do mês</p>
            </div>
            <MonthNav currentMonth={currentMonth} />
          </div>

          <SummaryCards summary={summary} context={analysisContext} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={categoryData} context={analysisContext} />
            <RecentTransactions transactions={recentTransactions} context={analysisContext} />
          </div>
        </main>
      </div>
    </div>
  )
}
