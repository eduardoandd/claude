"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { parseFile, ParsedTransaction } from "@/lib/import-parser"
import { CATEGORIES } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setStep("upload")
    setTransactions([])
    setError("")
    setImporting(false)
  }

  async function processFile(file: File) {
    setError("")
    try {
      const parsed = await parseFile(file)
      setTransactions(parsed)
      setStep("review")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar arquivo.")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function remove(index: number) {
    setTransactions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateCategory(index: number, category: string) {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, category } : t))
    )
  }

  async function handleImport() {
    if (transactions.length === 0) return
    setImporting(true)
    setError("")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("Usuário não autenticado.")
      setImporting(false)
      return
    }

    const rows = transactions.map((t) => ({
      user_id: user.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
    }))

    const { error } = await supabase.from("transactions").insert(rows)

    if (error) {
      setError(error.message)
      setImporting(false)
      return
    }

    onSuccess()
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "upload"
              ? "Importar transações"
              : `Revisar ${transactions.length} transaç${transactions.length === 1 ? "ão" : "ões"}`}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md shrink-0">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {step === "upload" ? (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Arraste o arquivo ou clique para selecionar</p>
              <p className="text-sm text-muted-foreground mt-1">Suporta .ofx e .csv exportados pelo Nubank</p>
              <input
                ref={inputRef}
                type="file"
                accept=".ofx,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1 border rounded-md p-3 bg-muted/30">
              <p className="font-medium text-foreground">Como exportar do Nubank:</p>
              <p>• Cartão de crédito: App → Fatura → Exportar fatura (.csv)</p>
              <p>• Conta corrente: App → Extrato → Baixar extrato (.ofx ou .csv)</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 min-h-0">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma transação restante.
                </p>
              ) : (
                <div className="divide-y">
                  {transactions.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 py-2.5">
                      <button
                        onClick={() => remove(i)}
                        className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                        title="Remover"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <span className="w-16 shrink-0 text-xs text-muted-foreground">
                        {t.date.split("-").reverse().join("/")}
                      </span>

                      <span className="flex-1 min-w-0 text-sm truncate" title={t.description}>
                        {t.description}
                      </span>

                      <span
                        className={`text-sm font-medium shrink-0 ${
                          t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500"
                        }`}
                      >
                        {t.type === "expense" ? "−" : "+"}
                        {formatCurrency(t.amount)}
                      </span>

                      <Select
                        value={t.category}
                        onValueChange={(v) => updateCategory(i, v)}
                      >
                        <SelectTrigger className="w-36 h-7 text-xs shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES[t.type].map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-xs">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 pt-2 border-t">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Voltar
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || transactions.length === 0}
              >
                {importing
                  ? "Importando..."
                  : `Importar ${transactions.length} transaç${transactions.length === 1 ? "ão" : "ões"}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
