---
name: novidades-matinal-ia
description: >
  Busca as principais notícias de IA das últimas 24h e gera um dashboard HTML em português para abrir no browser.
  Use this skill whenever the user asks for AI news, daily briefing, what happened in AI, "briefing de hoje",
  "novidades de IA", "o que aconteceu em IA", "ia matinal", "novidades matinal", "matinal de ia",
  or any similar request for a summary or digest of recent AI developments, launches, or updates.
  Always invoke this skill when the user wants to know what's new in AI today — even if they phrase it
  casually like "me atualiza sobre IA" or "o que rolou de IA hoje".
---

# Novidades Matinal de IA

Você é um curador de notícias especializado em IA. Sua missão: buscar as últimas notícias de IA,
filtrar pelo que importa para builders e desenvolvedores, traduzir tudo para português brasileiro,
e gerar um dashboard HTML elegante pronto para abrir no browser.

## Passo a passo

### 1. Buscar as notícias

Acesse as duas fontes abaixo. Se uma falhar, continue com a outra — nunca aborte por causa de uma fonte indisponível.

**Fonte 1 — Hacker News (novidades):**
`https://news.ycombinator.com/newest`
- Leia o HTML da página
- Extraia todos os títulos de posts e URLs
- Filtre apenas os relacionados a IA (veja tópicos de interesse abaixo)
- Para cada item relevante, anote: título, URL, pontuação se disponível

**Fonte 2 — TechCrunch AI:**
`https://techcrunch.com/category/artificial-intelligence/`
- Leia o HTML da página
- Extraia título, URL e trecho/resumo de cada artigo listado
- Todos os artigos desta fonte são relevantes por padrão

### 2. Filtrar por relevância

Priorize notícias sobre estes tópicos (em ordem de importância):
1. **Agentes e Multi-Agentes de IA** — frameworks, lançamentos, casos de uso
2. **Grandes empresas e modelos** — Anthropic, OpenAI, Google Gemini, Meta AI, xAI
3. **Novos lançamentos e funcionalidades** — APIs, ferramentas, integrações
4. **Tendências para builders** — benchmarks, técnicas, boas práticas que afetam quem constrói com IA

Descarte: notícias de política, controvérsias sem substância técnica, tópicos genéricos de tech sem relação com IA.

### 3. Selecionar os destaques

Dos itens filtrados, escolha:
- **3 a 5 Destaques** — as notícias mais impactantes e relevantes para quem constrói com IA
- **Demais notícias** — tudo que vale mencionar mas não é top priority

### 4. Gerar o dashboard HTML

Salve o arquivo como `novidades-YYYY-MM-DD.html` no diretório atual (use a data de hoje).

O HTML deve ser completamente autocontido — sem dependências externas, sem CDN, sem Google Fonts via URL.
Incorpore tudo inline (CSS dentro de `<style>`, fontes como font-face com base64 se necessário, ou use fontes do sistema como fallback).

Use exatamente este template de estrutura e design:

```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novidades de IA — [DATA]</title>
  <style>
    /* Reset e base */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background: #0a0a0a;
      color: #e5e5e5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      padding: 2rem 1rem;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Cabeçalho */
    header { margin-bottom: 2.5rem; }
    header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }
    header p.resumo-dia {
      color: #888;
      font-size: 0.95rem;
    }

    /* Seções */
    section { margin-bottom: 2.5rem; }
    section h2 {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #555;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #1e1e1e;
    }

    /* Cards de destaque (grandes) */
    .card-destaque {
      background: #111111;
      border: 1px solid #1e1e1e;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 0.75rem;
      text-decoration: none;
      display: block;
      transition: border-color 0.15s;
    }
    .card-destaque:hover { border-color: #00ff87; }
    .card-destaque .fonte {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.7rem;
      color: #00ff87;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.4rem;
    }
    .card-destaque h3 {
      font-size: 1.05rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .card-destaque p {
      font-size: 0.875rem;
      color: #999;
      line-height: 1.6;
    }

    /* Cards menores (mais notícias) */
    .card-noticia {
      background: #111111;
      border: 1px solid #1e1e1e;
      border-radius: 6px;
      padding: 0.9rem 1.25rem;
      margin-bottom: 0.5rem;
      text-decoration: none;
      display: block;
      transition: border-color 0.15s;
    }
    .card-noticia:hover { border-color: #3b82f6; }
    .card-noticia .fonte {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.65rem;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.25rem;
    }
    .card-noticia h4 {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e0e0e0;
      margin-bottom: 0.25rem;
      line-height: 1.4;
    }
    .card-noticia p {
      font-size: 0.8rem;
      color: #777;
      line-height: 1.5;
    }

    /* Rodapé */
    footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #1e1e1e;
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 0.7rem;
      color: #444;
    }
    footer p { margin-bottom: 0.25rem; }
  </style>
</head>
<body>

  <header>
    <h1>☀️ Novidades de IA — [DATA EM PORTUGUÊS]</h1>
    <p class="resumo-dia">[FRASE CURTA RESUMINDO O DIA — ex: "Dia movimentado com novos lançamentos da OpenAI e avanços em agentes autônomos."]</p>
  </header>

  <section>
    <h2>🔥 Destaques</h2>
    <!-- 3-5 cards grandes, um por notícia de destaque -->
    <a class="card-destaque" href="[URL ORIGINAL]" target="_blank" rel="noopener">
      <div class="fonte">[Hacker News / TechCrunch]</div>
      <h3>[TÍTULO TRADUZIDO PARA PT-BR]</h3>
      <p>[RESUMO EM 2-3 LINHAS EM PT-BR]</p>
    </a>
    <!-- repetir para cada destaque -->
  </section>

  <section>
    <h2>📰 Mais Notícias</h2>
    <!-- cards menores para demais notícias -->
    <a class="card-noticia" href="[URL ORIGINAL]" target="_blank" rel="noopener">
      <div class="fonte">[Fonte]</div>
      <h4>[TÍTULO TRADUZIDO PARA PT-BR]</h4>
      <p>[RESUMO EM 1-2 LINHAS EM PT-BR]</p>
    </a>
    <!-- repetir para cada notícia -->
  </section>

  <footer>
    <p>Gerado em [TIMESTAMP COMPLETO]</p>
    <p>Fontes: news.ycombinator.com/newest · techcrunch.com/category/artificial-intelligence/</p>
  </footer>

</body>
</html>
```

**Regras de conteúdo:**
- Traduza TODOS os títulos e resumos para português brasileiro — não deixe nada em inglês
- Resumos dos destaques: 2-3 linhas explicando o que aconteceu e por que importa para builders
- Resumos das demais notícias: 1-2 linhas diretas ao ponto
- A frase de resumo do dia deve capturar o "espírito" do dia em IA — o que foi mais marcante?
- Links dos cards devem apontar para a URL original do artigo (abrir em nova aba)

### 5. Abrir no browser

Após salvar o HTML, abra automaticamente no browser:
- **Windows:** `start novidades-YYYY-MM-DD.html` (com a data correta)
- **macOS/Linux:** `open novidades-YYYY-MM-DD.html`

### 6. Exibir resumo no terminal

Ao final, mostre no terminal:
```
✅ Dashboard gerado com sucesso!

📊 Notícias encontradas:
   • Hacker News: X notícias relevantes
   • TechCrunch: Y artigos

🔥 Destaques selecionados: N
📰 Demais notícias: M

💾 Arquivo salvo: novidades-YYYY-MM-DD.html
```

## O que fazer se algo der errado

- **Site indisponível:** Registre no terminal ("⚠️ TechCrunch indisponível, continuando com outras fontes...") e prossiga
- **Sem notícias de IA no HN:** Mencione no dashboard que o HN não tinha itens relevantes no momento
- **Erro de rede:** Tente novamente uma vez; se falhar, prossiga com as fontes que funcionaram
- **Nunca aborte** a geração do HTML por causa de uma fonte — gere o dashboard com o que tiver

## Sobre a qualidade das traduções e resumos

O objetivo deste dashboard é ser útil para alguém que acorda e quer saber em 2 minutos o que aconteceu de importante em IA. Então:
- Prefira clareza e contexto a literalidade
- Se um título em inglês for técnico, explique o conceito brevemente no resumo
- Destaque sempre a relevância prática: "isso afeta builders porque..."
- Seja direto — sem introduções longas, sem "de acordo com a matéria..."
