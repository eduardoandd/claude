<div align="center">

# 🤖 Aprendendo com Claude Code

*Meu primeiro repositório explorando o que é possível construir com IA no terminal*

![Status](https://img.shields.io/badge/status-em%20evolução-brightgreen)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20JS%20%7C%20Python%20%7C%20Next.js-blue)
![Feito com](https://img.shields.io/badge/feito%20com-Claude%20Code-blueviolet)

</div>

---

> A sensação de conversar com uma IA que escreve, executa e itera código em tempo real ainda parece mágica.
> Mal posso esperar para descobrir o que mais é possível construir com isso.

---

## 📁 Estrutura do Repositório

| Pasta | O que é | Tech |
|-------|---------|------|
| [`financas-app/`](#-financas-app) | App de finanças pessoais com IA | Next.js · Supabase · Claude API |
| [`ProjetoClaudeCode/`](#-projetoclaudecode) | Dashboard de Bitcoin em tempo real | HTML · JS · Chart.js |
| [`ia-matinal/`](#-ia-matinal) | Skill de briefing diário de IA | HTML · Web Scraping |
| [`skill-dashboard/`](#-skill-dashboard) | Gerador de dashboards de vendas | HTML · Excel |
| [`skill-html/`](#-skill-html) | Gerador de relatórios em HTML | HTML · PDF |
| [`skill-proposta-comercial/`](#-skill-proposta-comercial) | Gerador de propostas comerciais | PDF |
| [`skill-relatorio-pdf/`](#-skill-relatorio-pdf) | Gerador de relatórios PDF Credify | Python · PDF |

---

## 💰 Finanças App

Aplicativo completo de **finanças pessoais** construído do zero com Next.js 16, Supabase e Claude AI.

- Autenticação com confirmação por e-mail via **Supabase Auth**
- Dashboard com cards de receitas, despesas e saldo; gráfico de categorias por mês
- CRUD de transações com filtros por mês, tipo e categoria
- Importação de extratos do **Nubank** em `.ofx` e `.csv` com detecção automática de categoria
- **Análise com IA** em cada card do dashboard: modal com visualização rica + chat em streaming via Claude API
- Tema claro/escuro em toda a aplicação

---

## 🪙 ProjetoClaudeCode

Dashboard web para visualizar o preço do **Bitcoin em tempo real**, com gráficos históricos e seletor de período interativo.

- Consome a API pública do **CoinGecko** (sem autenticação)
- HTML/CSS/JS puro — sem frameworks, sem instalação
- **Chart.js** via CDN para os gráficos
- Cache local de 60s para não exceder o rate limit
- Um único arquivo — abre direto no browser

---

## ☀️ ia-matinal

Skill que gera um **briefing diário de IA** com um comando só.

Ao ser invocada, o Claude:
1. Busca as últimas notícias em **Hacker News** e **TechCrunch**
2. Filtra o que importa para builders e desenvolvedores
3. Traduz tudo para **português brasileiro**
4. Gera um dashboard HTML elegante pronto para abrir no browser

Inclui `novidades-2026-04-13.html` como exemplo real do output gerado.

---

## 📊 skill-dashboard

Skill para geração de **dashboards de vendas** personalizados.

A partir de uma planilha `.xlsx` e um brand guideline em PDF, o Claude gera um dashboard HTML completo com a identidade visual da marca.

---

## 📄 skill-html

Skill para geração de **relatórios em HTML** a partir de documentos.

Basta enviar um arquivo (`.pdf`, `.xlsx`, `.csv`) e o Claude monta um relatório visual pronto para apresentação.

---

## 💼 skill-proposta-comercial

Skill para geração automática de **propostas comerciais** em PDF.

Recebe um resumo de reunião + brand guideline da empresa e monta uma proposta completa e profissional. Inclui exemplos reais de propostas geradas para diferentes clientes.

---

## 📑 skill-relatorio-pdf

Skill para geração de **relatórios PDF** com a identidade visual da Credify.

- Cores: vermelho `#E71225` · cinza escuro `#1A1A2E` · turquesa `#00B4D8`
- Fonte **Poppins**, estilo clean e corporativo
- Totalmente dinâmica — adapta estrutura, seções e tom ao conteúdo fornecido
- Aceita `.xlsx`, `.pdf`, `.csv`, `.docx` ou contexto da conversa

---

## 🧠 O que estou aprendendo

```
✦ Criar e usar Skills personalizadas no Claude Code
✦ Fazer o Claude ler, criar e executar arquivos de forma autônoma
✦ Transformar prompts em ferramentas reutilizáveis
✦ Integrar APIs externas e gerar outputs ricos (HTML, PDF)
✦ Iterar rapidamente com IA no loop de desenvolvimento
✦ Construir aplicações full-stack com Next.js, Supabase e autenticação
✦ Integrar Claude API com streaming para experiências conversacionais em tempo real
```

---

<div align="center">

*Cada pasta é um experimento. Cada skill é uma nova forma de entender o que o Claude Code é capaz de fazer.*

**🚀 Repositório em constante evolução**

</div>
