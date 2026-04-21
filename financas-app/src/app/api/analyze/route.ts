import Anthropic from "@anthropic-ai/sdk"
import { MonthlySummary, CategoryExpense, Transaction } from "@/types"

interface AnalyzeRequestBody {
  cardType: "income" | "expenses" | "balance" | "categories" | "recent"
  data: {
    summary?: MonthlySummary
    categories?: CategoryExpense[]
    transactions?: Transaction[]
    month: string
  }
  messages: Array<{ role: "user" | "assistant"; content: string }>
}

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function buildSystemPrompt(cardType: string, data: AnalyzeRequestBody["data"]): string {
  const { summary, categories, transactions, month } = data
  const [year, monthNum] = month.split("-")
  const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  let ctx = `Você é um analista financeiro pessoal especializado em finanças pessoais brasileiras. Analise os dados financeiros abaixo e forneça insights práticos, objetivos e acionáveis em português. Use bullet points quando adequado. Seja direto e destaque pontos de atenção importantes.

Período: ${monthName}
`

  if (summary) {
    const savingsRate =
      summary.totalIncome > 0 ? ((summary.balance / summary.totalIncome) * 100).toFixed(1) : "0.0"
    ctx += `
## Resumo financeiro
- Receitas totais: ${fmt(summary.totalIncome)}
- Despesas totais: ${fmt(summary.totalExpenses)}
- Saldo: ${fmt(summary.balance)}
- Taxa de economia: ${savingsRate}%
`
  }

  if (categories && categories.length > 0) {
    ctx += `
## Despesas por categoria
${categories.map((c) => `- ${c.category}: ${fmt(c.amount)} (${c.percentage.toFixed(1)}%)`).join("\n")}
`
  }

  if (transactions && transactions.length > 0) {
    const income = transactions.filter((t) => t.type === "income")
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)

    if (income.length > 0) {
      ctx += `
## Receitas (${income.length} transações)
${income.slice(0, 15).map((t) => `- ${t.date}: ${t.description || t.category} — ${fmt(t.amount)}`).join("\n")}
`
    }

    if (expenses.length > 0) {
      ctx += `
## Despesas (${expenses.length} transações, ordenadas por valor)
${expenses.slice(0, 15).map((t) => `- ${t.date}: ${t.description || t.category} [${t.category}] — ${fmt(t.amount)}`).join("\n")}
`
    }
  }

  return ctx
}

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequestBody = await req.json()
    const { cardType, data, messages } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response("ANTHROPIC_API_KEY não configurada no servidor.", { status: 500 })
    }

    const client = new Anthropic({ apiKey })
    const systemPrompt = buildSystemPrompt(cardType, data)

    const stream = client.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 8096,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Analyze API error:", error)
    return new Response("Erro ao processar análise.", { status: 500 })
  }
}
