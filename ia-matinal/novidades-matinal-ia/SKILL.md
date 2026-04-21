---
name: novidades-matinal-ia
description: >
  Gera um dashboard HTML em português com as principais notícias de IA das últimas 24h.
  Use esta skill SEMPRE que o usuário pedir "briefing de hoje", "novidades de IA", "o que aconteceu em IA",
  "ia matinal", "novidades matinal", "me atualiza sobre IA", "resumo de IA", "o que tem de novo em IA",
  ou qualquer variação pedindo um resumo/briefing de notícias de inteligência artificial.
  A skill busca notícias no Hacker News e TechCrunch, filtra conteúdo relevante sobre IA,
  traduz para português brasileiro e gera um arquivo HTML autocontido pronto para abrir no browser.
---

# Novidades Matinal de IA

Você é um curador de notícias de IA. Sua missão: buscar as notícias mais relevantes das últimas horas,
filtrar o que realmente importa para quem constrói com IA, e entregar um dashboard visual limpo em português.

## Fluxo de execução

Execute estas etapas **em ordem**, sem pular nenhuma:

### 1. Buscar conteúdo das fontes

Use `WebFetch` para acessar cada fonte. Se uma falhar, continue com as demais — não aborte tudo.

**Fonte 1 — Hacker News (newest):**
```
URL: https://news.ycombinator.com/newest
```
Extraia todos os itens visíveis: título, URL do link original e pontuação (se disponível).

**Fonte 2 — TechCrunch AI:**
```
URL: https://techcrunch.com/category/artificial-intelligence/
```
Extraia: título do artigo, URL, e o trecho de descrição/subtítulo quando disponível.

### 2. Filtrar notícias relevantes

Mantenha apenas itens relacionados a estes tópicos:
- Agentes e Multi-Agentes de IA
- Anthropic, OpenAI, Google Gemini, Meta AI e seus modelos/produtos
- Novas funcionalidades, lançamentos e APIs de IA
- Tendências, benchmarks e pesquisas relevantes para quem desenvolve com IA
- Infraestrutura de IA (compute, chips, cloud para IA)

Descarte notícias sem relação com IA ou que sejam puramente financeiras/corporativas sem impacto técnico.

### 3. Classificar em destaques vs. demais

Selecione **3 a 5 destaques** — os itens mais impactantes para builders de IA.
Os critérios para destaque: anúncio de novo modelo/produto, mudança relevante de API, pesquisa com implicações práticas imediatas.

O restante das notícias relevantes vai na seção "Mais Notícias".

### 4. Traduzir para português brasileiro

Todos os títulos e resumos no HTML devem estar em **português brasileiro**.
- Traduza os títulos com fidelidade, mantendo nomes próprios (GPT-4o, Claude, Gemini, etc.)
- Escreva resumos em pt-BR — 2-3 linhas para destaques, 1-2 linhas para demais notícias
- Tom: direto, informativo, sem jargão desnecessário

### 5. Gerar o arquivo HTML

Salve o arquivo como `novidades-YYYY-MM-DD.html` na pasta de trabalho atual (onde o Claude Code está rodando).

Use esta data: a data atual do sistema no formato `YYYY-MM-DD` para o nome do arquivo.

**Estrutura obrigatória do HTML:**

```
☀️ Novidades de IA — [data por extenso em português, ex: "13 de abril de 2025"]
[Frase curta de 1 linha resumindo o tom do dia, ex: "Dia de lançamentos: OpenAI e Anthropic dominam as manchetes"]

🔥 Destaques
[Cards grandes — um por notícia destacada]
  - Título em pt-BR (clicável → link original, target="_blank")
  - Badge com nome da fonte (Hacker News ou TechCrunch)
  - Resumo em 2-3 linhas em pt-BR

📰 Mais Notícias
[Cards compactos — um por notícia]
  - Título em pt-BR (clicável → link original, target="_blank")
  - Fonte
  - Resumo em 1-2 linhas

Rodapé:
  - "Gerado em [timestamp completo]"
  - "Fontes: Hacker News · TechCrunch"
```

**Design — aplique exatamente estas especificações:**

```css
/* Paleta */
background: #0a0a0a
cards: #111111
bordas: #1e1e1e
texto principal: #e5e5e5
texto secundário: #888888
accent destaques: #00ff87
accent demais: #3b82f6
badge fonte: fundo #1e1e1e, texto #888

/* Tipografia — importar do Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
font-family principal: 'Inter', sans-serif
datas e timestamps: 'DM Mono', monospace

/* Layout */
max-width: 860px, centrado
responsivo (mobile-first)
cards com border-left colorida (accent cor correspondente)
sem gráficos, sem rankings, sem ícones decorativos desnecessários
hover nos cards: leve elevação de background (#161616)
```

O HTML deve ser **autocontido** — tudo inline no arquivo, sem arquivos externos além do Google Fonts.

### 6. Exibir resumo no terminal

Ao final, imprima no terminal:

```
✅ Dashboard gerado: novidades-YYYY-MM-DD.html
📊 Notícias encontradas:
   • Hacker News: X itens coletados, Y relevantes
   • TechCrunch:  X itens coletados, Y relevantes
🔥 Destaques selecionados: N
📰 Demais notícias: M
```

### 7. Abrir no browser

Execute o comando adequado ao sistema operacional:

- **Windows:** `start novidades-YYYY-MM-DD.html`
- **macOS:** `open novidades-YYYY-MM-DD.html`
- **Linux:** `xdg-open novidades-YYYY-MM-DD.html`

## Tratamento de erros

- Se uma fonte falhar no WebFetch: registre o erro internamente, continue com as demais, mencione no rodapé do HTML quais fontes foram consultadas com sucesso
- Se nenhuma fonte retornar conteúdo: informe o usuário claramente e não gere HTML vazio
- Se o número de notícias relevantes for menor que 5: gere o dashboard assim mesmo com o que houver

## Exemplo de card HTML (destaque)

```html
<a href="[URL_ORIGINAL]" target="_blank" class="card destaque">
  <div class="card-header">
    <span class="badge">TechCrunch</span>
  </div>
  <h2>Título traduzido para pt-BR</h2>
  <p>Resumo em português, 2-3 linhas explicando o que aconteceu e por que importa para quem desenvolve com IA.</p>
</a>
```

Adapte para cards compactos (seção "Mais Notícias") com menos padding e fonte menor.
