# Meu Primeiro Repositório com Claude Code

Este é o meu primeiro repositório explorando o **Claude Code** — e estou extremamente animado com tudo que já aprendi até aqui. A sensação de conversar com uma IA que escreve, executa e itera código em tempo real ainda parece mágica. Mal posso esperar para descobrir o que mais é possível construir com isso.

---

## Estrutura do Repositório

### `ProjetoClaudeCode/`
Meu primeiro projeto concreto: um **dashboard web de Bitcoin em tempo real**. Consome a API pública do CoinGecko, exibe o preço atual com gráficos históricos e um seletor de período interativo. Tudo em um único arquivo HTML/CSS/JS puro, sem frameworks, usando Chart.js via CDN. Simples, direto e funcional.

### `ia-matinal/`
**Skill "Novidades Matinal de IA"**: ao ser invocada, o Claude busca as últimas notícias de IA nas últimas 24h (Hacker News + TechCrunch), filtra o que importa para builders e desenvolvedores, traduz tudo para português e gera um dashboard HTML elegante pronto para abrir no browser. Inclui o arquivo `novidades-2026-04-13.html` como exemplo real do output produzido.

### `skill-dashboard/`
Skill de **geração de dashboards de vendas**. A partir de dados em planilha (`.xlsx`) e de um brand guideline em PDF, o Claude gera um dashboard HTML completo com identidade visual da marca. Inclui os arquivos de compras do ecossistema e o resultado gerado (`dashboard_vendas_20260418.html`).

### `skill-html/`
Skill para **geração de relatórios em HTML** a partir de documentos enviados. O exemplo de uso foi a criação de um relatório de custos operacionais de chatbot a partir de um PDF fornecido.

### `skill-proposta-comercial/`
Skill para **geração automática de propostas comerciais** em PDF. Recebe um resumo de reunião e o brand guideline da empresa, e monta uma proposta completa e profissional. Inclui exemplos reais de propostas geradas para diferentes clientes.

### `skill-relatorio-pdf/`
Skill para **geração de relatórios PDF** com a identidade visual da Credify (vermelho, cinza escuro, turquesa, fonte Poppins). Totalmente dinâmica: adapta estrutura, seções e tom com base no conteúdo fornecido — seja um arquivo `.xlsx`, `.pdf`, `.csv` ou contexto da conversa.

---

## O que estou aprendendo

- Como criar e usar **Skills personalizadas** no Claude Code
- Como o Claude pode **ler, criar e executar arquivos** de forma autônoma
- Como transformar prompts em **ferramentas reutilizáveis** para tarefas repetitivas
- Como integrar **APIs externas**, ler documentos e gerar outputs ricos (HTML, PDF)

---

> Repositório em constante evolução. Cada pasta é um experimento, cada skill é uma nova forma de entender o que o Claude Code é capaz de fazer.
