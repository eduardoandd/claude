"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { ImportDialog } from "@/components/transactions/import-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/types"
import { Plus, Upload } from "lucide-react"
import { format } from "date-fns"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"))
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserEmail(user.email ?? "")

    const [year, monthNum] = month.split("-")
    const startDate = `${year}-${monthNum}-01`
    const lastDay = new Date(Number(year), Number(monthNum), 0).getDate()
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, "0")}`

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter)
    }

    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter)
    }

    const { data } = await query
    setTransactions((data ?? []) as Transaction[])
    setLoading(false)
  }, [month, typeFilter, categoryFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta transação?")) return
    const supabase = createClient()
    await supabase.from("transactions").delete().eq("id", id)
    fetchTransactions()
  }

  function handleEdit(t: Transaction) {
    setEditingTransaction(t)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditingTransaction(null)
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={userEmail} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Transações</h1>
              <p className="text-sm text-muted-foreground">
                {transactions.length} transaç{transactions.length === 1 ? "ão" : "ões"} encontrada{transactions.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2 sm:w-auto w-full">
              <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2 flex-1 sm:flex-none">
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button onClick={() => setFormOpen(true)} className="gap-2 flex-1 sm:flex-none">
                <Plus className="h-4 w-4" />
                Nova transação
              </Button>
            </div>
          </div>

          <TransactionFilters
            month={month}
            type={typeFilter}
            category={categoryFilter}
            onMonthChange={setMonth}
            onTypeChange={setTypeFilter}
            onCategoryChange={setCategoryFilter}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : (
                <TransactionList
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={fetchTransactions}
        editingTransaction={editingTransaction}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={fetchTransactions}
      />
    </div>
  )
}
