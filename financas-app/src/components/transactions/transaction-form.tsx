"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES, Transaction, TransactionFormData, TransactionType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editingTransaction?: Transaction | null
}

const defaultFormData: TransactionFormData = {
  type: "expense",
  amount: 0,
  date: format(new Date(), "yyyy-MM-dd"),
  category: "",
  description: "",
}

export function TransactionForm({ open, onClose, onSuccess, editingTransaction }: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        date: editingTransaction.date,
        category: editingTransaction.category,
        description: editingTransaction.description,
      })
    } else {
      setForm(defaultFormData)
    }
    setError("")
  }, [editingTransaction, open])

  const categories = CATEGORIES[form.type]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!form.category) {
      setError("Selecione uma categoria.")
      setLoading(false)
      return
    }

    if (form.amount <= 0) {
      setError("O valor deve ser maior que zero.")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("Usuário não autenticado.")
      setLoading(false)
      return
    }

    const payload = {
      user_id: user.id,
      type: form.type,
      amount: form.amount,
      date: form.date,
      category: form.category,
      description: form.description,
    }

    let result
    if (editingTransaction) {
      result = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", editingTransaction.id)
    } else {
      result = await supabase.from("transactions").insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  function handleTypeChange(type: TransactionType) {
    setForm((prev) => ({ ...prev, type, category: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={cn(
                "py-2.5 rounded-lg text-sm font-medium border-2 transition-colors",
                form.type === "income"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={cn(
                "py-2.5 rounded-lg text-sm font-medium border-2 transition-colors",
                form.type === "expense"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Despesa
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.amount || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm((prev) => ({ ...prev, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Salvando..." : editingTransaction ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
