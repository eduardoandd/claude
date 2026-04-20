---
name: relatorio-pdf
description: >
  Gera automaticamente um relatório PDF profissional com a identidade visual da Credify.
  Use esta skill SEMPRE que o usuário pedir um "relatório PDF", "relatório em PDF", "gera um PDF",
  "monta um relatório", "cria um relatório", "exporta em PDF", "me dá um PDF com isso" ou qualquer
  variação — mesmo que informal. Também ativar quando o usuário enviar um arquivo (.pdf, .xlsx, .csv,
  .json, .docx) e pedir análise, resumo ou relatório a partir dele. O relatório é 100% dinâmico e
  personalizado para o contexto: adapta estrutura, linguagem, seções e tom com base no conteúdo
  fornecido. Saída sempre em PDF com identidade visual Credify (azul marinho, turquesa, Poppins).
---

# Relatório PDF — Credify

Você foi ativado para gerar um relatório PDF profissional com a identidade visual da Credify.

## Identidade Visual Credify

| Elemento | Valor |
|---|---|
| Vermelho Credify (primária, logo, destaques) | `#E71225` |
| Cinza Escuro / Quase Preto (headers, fundos) | `#1A1A2E` |
| Azul Turquesa (secundária, links, detalhes) | `#00B4D8` |
| Cinza Escuro (textos principais) | `#1F2937` |
| Cinza Médio (textos secundários) | `#6B7280` |
| Cinza Claro (fundos de cards, divisórias) | `#F3F4F6` |
| Vermelho Suave (fundos de alerta) | `#FFF0F1` |
| Branco (fundo principal) | `#FFFFFF` |
| Fonte | **Poppins** (via Google Fonts) |
| Títulos | Poppins SemiBold / Bold |
| Subtítulos | Poppins Medium |
| Corpo | Poppins Regular |
| Labels / Destaques | Poppins SemiBold |

**Estilo visual:** Clean, corporativo, muito espaço em branco, cards com bordas sutis, ícones minimalistas. Tom: confiança, tecnologia, segurança.

## Script de geração

O script `scripts/generate_report.py` cuida de toda a geração do PDF. Você passa o conteúdo como JSON e ele retorna o arquivo PDF pronto.

## Fluxo de execução

### Passo 1 — Ler e entender o conteúdo

Dependendo do que o usuário forneceu:

**Se enviou um arquivo:**
- `.pdf` → use `pdfplumber` para extrair texto e tabelas
- `.xlsx` / `.csv` → use `pandas` para ler os dados
- `.json` → `json.load()` direto
- `.docx` → use `python-docx`

**Se o contexto vem da conversa:**
- Extraia os pontos principais do que foi discutido

Em ambos os casos, extraia:
- **Tema / assunto principal** do relatório
- **Dados quantitativos** (números, métricas, tabelas)
- **Insights e análises** (o que os dados significam)
- **Problemas ou riscos** identificados
- **Conclusões e recomendações**
- **Público-alvo** do relatório (quem vai ler)

### Passo 2 — Montar o conteúdo dinâmico

Com base no que foi extraído, construa um JSON de conteúdo seguindo a estrutura abaixo. **A estrutura é totalmente adaptável** — adicione, remova ou renomeie seções conforme o contexto exige.

```json
{
  "titulo": "Título do Relatório",
  "subtitulo": "Subtítulo opcional em uma linha",
  "data": "18 de abril de 2026",
  "autor": "Credify",
  "sumario_executivo": "Parágrafo curto com o resumo mais importante do relatório.",
  "secoes": [
    {
      "tipo": "texto",
      "titulo": "Título da Seção",
      "conteudo": "Texto da seção..."
    },
    {
      "tipo": "metricas",
      "titulo": "Indicadores Chave",
      "itens": [
        {"label": "Métrica 1", "valor": "R$ 1.200.000", "descricao": "Opcional"},
        {"label": "Métrica 2", "valor": "98,5%", "descricao": "Opcional"}
      ]
    },
    {
      "tipo": "tabela",
      "titulo": "Título da Tabela",
      "cabecalho": ["Col 1", "Col 2", "Col 3"],
      "linhas": [
        ["Dado 1", "Dado 2", "Dado 3"]
      ]
    },
    {
      "tipo": "lista",
      "titulo": "Título da Lista",
      "itens": ["Item 1", "Item 2", "Item 3"]
    },
    {
      "tipo": "destaque",
      "titulo": "Atenção",
      "conteudo": "Bloco de destaque para informações críticas ou alertas."
    }
  ],
  "conclusao": "Parágrafo final com conclusão e próximos passos.",
  "rodape": "Credify | Relatório gerado automaticamente"
}
```

**Regras para montar o conteúdo:**
- Use linguagem profissional em português brasileiro
- Adapte o tom ao contexto: técnico para dados de TI, executivo para gestão, analítico para financeiro
- Se houver dados numéricos, crie sempre uma seção `metricas` com os principais KPIs
- Se houver tabelas nos dados originais, preserve-as com o tipo `tabela`
- Use `destaque` para riscos, alertas ou informações críticas
- O relatório deve ser autoexplicativo — quem lê não precisa ter visto os dados originais

### Passo 3 — Gerar o PDF

Salve o JSON de conteúdo em `/tmp/relatorio_content.json` e execute:

```bash
python3 /sessions/busy-youthful-tesla/mnt/.claude/skills/relatorio-pdf/scripts/generate_report.py \
  --content /tmp/relatorio_content.json \
  --output /sessions/busy-youthful-tesla/mnt/skill-relatorio-pdf/relatorio_[tema]_[data].pdf
```

Substitua `[tema]` pelo assunto do relatório e `[data]` pela data atual no formato `AAAAMMDD`.

Se o script não estiver disponível no caminho da skill, use o caminho alternativo:
```bash
python3 /sessions/busy-youthful-tesla/relatorio-pdf/scripts/generate_report.py \
  --content /tmp/relatorio_content.json \
  --output /sessions/busy-youthful-tesla/mnt/skill-relatorio-pdf/relatorio_[tema]_[data].pdf
```

### Passo 4 — Verificar e entregar

Após gerar o PDF:
1. Confirme que o arquivo existe e tem tamanho > 0
2. Informe ao usuário com link direto para abrir
3. Dê um resumo de 2-3 linhas do que foi incluído no relatório

## Troubleshooting

**Poppins não instalada:** O script baixa automaticamente via `requests`. Se falhar, usa `Helvetica` como fallback.

**Arquivo de entrada não reconhecido:** Tente ler como texto puro e extrair o máximo de contexto possível.

**PDF vazio ou corrompido:** Verifique se o JSON de conteúdo foi salvo corretamente antes de chamar o script.
