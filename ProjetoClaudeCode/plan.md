# Plano: Dashboard Bitcoin em HTML

## Contexto

O objetivo é criar um dashboard web simples, visual e fácil de entender sobre o preço do Bitcoin. Ele será feito com HTML, CSS e JavaScript puros — sem precisar instalar nada — e vai buscar dados reais da CoinGecko API (gratuita e sem cadastro).

---

## Stack escolhida

| Tecnologia | Função |
|---|---|
| HTML + CSS + JS puro | Interface, sem frameworks |
| Chart.js (via CDN) | Gráficos interativos |
| CoinGecko API (gratuita) | Dados reais do Bitcoin |

Motivo: máxima simplicidade. Um único arquivo HTML que funciona abrindo no navegador.

---

## Arquivos do projeto

```
ProjetoClaudeCode/
├── index.html        ← Dashboard completo (tudo em um arquivo)
├── CLAUDE.md         ← Documentação do projeto para o Claude Code
└── plan.md           ← Este plano
```

---

## Funcionalidades do dashboard

### Cards de resumo (topo)
- Preço atual em USD
- Variação em 24h (verde/vermelho)
- Market cap
- Volume 24h

### Gráficos
1. **Variação semanal** — últimos 7 dias (dados horários), linha simples
2. **Variação anual** — últimos 365 dias (dados diários), linha suavizada

### Seletor de período interativo
- Botões rápidos: 7D | 30D | 90D | 1A
- Inputs de data (de / até) para range customizado
- Ao selecionar, o gráfico atualiza automaticamente

---

## Endpoints da CoinGecko API

```
# Preço atual + variação 24h
GET https://api.coingecko.com/api/v3/simple/price
  ?ids=bitcoin&vs_currencies=usd
  &include_market_cap=true&include_24hr_vol=true&include_24hr_change=true

# Histórico por período (dias pré-definidos)
GET https://api.coingecko.com/api/v3/coins/bitcoin/market_chart
  ?vs_currency=usd&days=7

# Histórico por range de datas customizado
GET https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range
  ?vs_currency=usd&from=<unix_timestamp>&to=<unix_timestamp>
```

**Rate limit:** 5–15 req/min (plano público gratuito). O dashboard cacheia os dados por 60 segundos para evitar bloqueio.

---

## Como testar

1. Abrir `index.html` diretamente no navegador (Chrome/Firefox/Edge)
2. Verificar se os cards carregam com dados reais
3. Clicar nos botões 7D, 30D, 90D, 1A e ver o gráfico atualizar
4. Selecionar datas customizadas e confirmar que o gráfico responde
5. Abrir o DevTools (F12) > aba Network: confirmar que as chamadas à API retornam 200
