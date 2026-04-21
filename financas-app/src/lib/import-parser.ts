export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  rawId?: string
}

export async function parseFile(file: File): Promise<ParsedTransaction[]> {
  const content = await file.text()
  const name = file.name.toLowerCase()

  if (name.endsWith(".ofx") || content.includes("<OFX>") || content.includes("<STMTTRN>")) {
    return parseOFX(content)
  }

  if (name.endsWith(".csv")) {
    return parseCSV(content)
  }

  throw new Error("Formato não suportado. Use arquivos .ofx ou .csv exportados pelo Nubank.")
}

function parseOFX(content: string): ParsedTransaction[] {
  const results: ParsedTransaction[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi

  for (const match of content.matchAll(trnRegex)) {
    const block = match[1]

    const dtPosted = getOFXField(block, "DTPOSTED")
    const trnAmt = getOFXField(block, "TRNAMT")
    const trnType = getOFXField(block, "TRNTYPE")
    const memo = getOFXField(block, "MEMO") ?? getOFXField(block, "NAME") ?? ""
    const fitId = getOFXField(block, "FITID") ?? undefined

    if (!dtPosted || !trnAmt) continue

    const amount = parseFloat(trnAmt.replace(",", "."))
    if (isNaN(amount) || amount === 0) continue

    const date = parseOFXDate(dtPosted)
    if (!date) continue

    const type: "income" | "expense" =
      trnType?.toUpperCase() === "CREDIT" ? "income" :
      trnType?.toUpperCase() === "DEBIT" ? "expense" :
      amount >= 0 ? "income" : "expense"

    results.push({
      date,
      description: memo.trim() || "Sem descrição",
      amount: Math.abs(amount),
      type,
      category: guessCategory(memo, type),
      rawId: fitId,
    })
  }

  if (results.length === 0) {
    throw new Error("Nenhuma transação encontrada no arquivo OFX.")
  }

  return results
}

function getOFXField(block: string, field: string): string | null {
  const match = block.match(new RegExp(`<${field}>([^<\n\r]+)`, "i"))
  return match ? match[1].trim() : null
}

function parseOFXDate(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

function parseCSV(content: string): ParsedTransaction[] {
  const clean = content.replace(/^﻿/, "").trim()
  const lines = clean.split(/\r?\n/)
  if (lines.length < 2) throw new Error("Arquivo CSV vazio.")

  const header = lines[0].toLowerCase()
  const results: ParsedTransaction[] = []

  // Nubank cartão de crédito: date,title,amount
  if (header.match(/date.*title|title.*amount/)) {
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSVLine(lines[i])
      if (cols.length < 3) continue

      const dateStr = cols[0]?.trim()
      const description = cols[1]?.trim()
      const amountStr = cols[2]?.trim()

      if (!dateStr || !description || !amountStr) continue

      const amount = parseFloat(amountStr.replace(",", "."))
      if (isNaN(amount) || amount === 0) continue

      const date = parseDateStr(dateStr)
      if (!date) continue

      const type: "income" | "expense" = amount < 0 ? "expense" : "income"

      results.push({
        date,
        description,
        amount: Math.abs(amount),
        type,
        category: guessCategory(description, type),
      })
    }
  }
  // Nubank conta: Data,Valor,Identificador,Descrição
  else if (header.match(/data.*valor|valor.*descri/)) {
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSVLine(lines[i])
      if (cols.length < 2) continue

      const dateStr = cols[0]?.trim()
      const amountStr = cols[1]?.trim()
      const rawId = cols[2]?.trim()
      const description = cols[3]?.trim() ?? cols[2]?.trim() ?? ""

      if (!dateStr || !amountStr) continue

      const amount = parseFloat(amountStr.replace(",", "."))
      if (isNaN(amount) || amount === 0) continue

      const date = parseDateStr(dateStr)
      if (!date) continue

      const type: "income" | "expense" = amount < 0 ? "expense" : "income"

      results.push({
        date,
        description: description || "Sem descrição",
        amount: Math.abs(amount),
        type,
        category: guessCategory(description, type),
        rawId,
      })
    }
  } else {
    throw new Error("Formato CSV não reconhecido. Use o extrato exportado pelo Nubank.")
  }

  if (results.length === 0) {
    throw new Error("Nenhuma transação encontrada no arquivo CSV.")
  }

  return results
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseDateStr(dateStr: string): string | null {
  // DD/MM/YYYY → YYYY-MM-DD
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`

  // YYYY-MM-DD (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr

  return null
}

const EXPENSE_MAP: Record<string, string[]> = {
  Alimentação: [
    "restaurante", "lanche", "ifood", "uber eats", "rappi", "delivery", "pizza",
    "burger", "mcdonalds", "subway", "padaria", "mercado", "supermercado",
    "carrefour", "extra", "hortifruti", "açougue", "food", "café", "cafe",
    "bistro", "snack", "pão de açúcar", "walmart",
  ],
  Transporte: [
    "uber", "99app", "cabify", "ônibus", "onibus", "metrô", "metro",
    "gasolina", "combustível", "combustivel", "posto", "estacionamento",
    "pedágio", "pedagio", "passagem", "taxi", "táxi", "bilhete único",
  ],
  Moradia: [
    "aluguel", "condomínio", "condominio", "água", "agua", "energia",
    "internet", "gás", "gas", "vivo", "claro", "tim", "net", "sky",
    "enel", "sabesp", "copasa", "cemig",
  ],
  Saúde: [
    "farmácia", "farmacia", "drogaria", "médico", "medico", "hospital",
    "clínica", "clinica", "plano", "dental", "dentista", "exame",
    "ultrafarma", "droga", "remédio", "remedio",
  ],
  Educação: [
    "escola", "faculdade", "universidade", "curso", "livro",
    "udemy", "coursera", "alura", "rocketseat",
  ],
  Lazer: [
    "cinema", "netflix", "spotify", "disney", "hbo", "max",
    "amazon prime", "youtube", "teatro", "show", "ingresso",
    "parque", "bar", "steam", "playstation", "xbox",
  ],
  Vestuário: [
    "roupa", "calçado", "sapato", "tênis", "tenis", "nike", "adidas",
    "zara", "renner", "c&a", "riachuelo", "hering", "shein",
  ],
  Assinaturas: [
    "netflix", "spotify", "amazon", "apple", "google one", "microsoft",
    "adobe", "notion", "github", "vercel", "digitalocean", "hostinger",
  ],
}

const INCOME_MAP: Record<string, string[]> = {
  Salário: ["salário", "salario", "pagamento", "folha", "remuneração", "remuneracao", "pgto"],
  Freelance: ["freelance", "projeto", "consultoria", "serviço prestado", "prestação"],
  Investimentos: ["rendimento", "dividendo", "juros", "cdb", "lci", "lca", "fundo", "tesouro", "selic"],
  Presente: ["presente", "gift", "doação", "doacao"],
}

export function guessCategory(description: string, type: "income" | "expense"): string {
  const lower = description.toLowerCase()
  const map = type === "expense" ? EXPENSE_MAP : INCOME_MAP

  for (const [category, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }

  return "Outros"
}
