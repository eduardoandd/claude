export type TransactionType = "income" | "expense"

export const CATEGORIES = {
  income: ["Salário", "Freelance", "Investimentos", "Presente", "Outros"],
  expense: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Vestuário",
    "Assinaturas",
    "Outros",
  ],
} as const

export type IncomeCategory = (typeof CATEGORIES.income)[number]
export type ExpenseCategory = (typeof CATEGORIES.expense)[number]

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  date: string
  category: string
  description: string
  created_at: string
}

export interface TransactionFormData {
  type: TransactionType
  amount: number
  date: string
  category: string
  description: string
}

export interface MonthlySummary {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface CategoryExpense {
  category: string
  amount: number
  percentage: number
}
