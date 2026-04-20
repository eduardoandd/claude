# Bitcoin Dashboard — CLAUDE.md

## O que é este projeto

Dashboard web para visualizar o preço do Bitcoin em tempo real, com gráficos históricos e seletor de período interativo.

## Como rodar

Abrir `index.html` diretamente no navegador. Nenhuma instalação necessária.

## Estrutura

```
index.html   → tudo em um arquivo: HTML + CSS + JS
plan.md      → plano de desenvolvimento
CLAUDE.md    → este arquivo
```

## API utilizada

**CoinGecko API** — gratuita, sem autenticação, sem chave de API.

- Base URL: `https://api.coingecko.com/api/v3`
- Rate limit: 5–15 req/min (plano público)
- Cache local: 60 segundos por endpoint para não exceder o limite

## Decisões técnicas

- **Sem frameworks** — HTML/CSS/JS puro para máxima simplicidade
- **Chart.js via CDN** — biblioteca de gráficos carregada diretamente, sem npm
- **Cache em memória** — objeto `cache` no JS evita chamadas repetidas à API
- **Um único arquivo** — facilita abrir, compartilhar e entender

## O que não fazer

- Não adicionar backend ou servidor — o projeto é 100% client-side
- Não instalar dependências — usar apenas CDN
- Não autenticar na API — a versão pública é suficiente
