# Remoção de Dados Sensíveis do Painel Principal (Total Mensal & Acumulado)

Eliminação dos indicadores financeiros consolidados de despesas e acumulados da barra lateral e da tela de novos lançamentos, garantindo que valores macro fiquem restritos exclusivamente ao módulo de Relatórios e Inteligência para administradores.

> [!IMPORTANT]
> **Decisões Confirmadas:**
> - **Onde remover:** Remoção completa dos cartões na barra lateral esquerda (`Sidebar`) e do cartão de resumo operacional na tela de novos lançamentos (`NovoLancamentoView`).
> - **Visualização de Totais:** O acesso aos valores consolidados permanecerá restrito e exclusivo dentro da aba de **Relatórios** para usuários com perfil de **Administrador**.

---

### 1. Visão Geral & Privacidade de Dados

- **Objetivo:** Proteger dados financeiros estratégicos contra visualização indesejada por operadores ou pessoas próximas às telas operacionais no dia a dia.
- **Público-alvo:** Administradores e Operadores de Lançamento. O operador tem acesso focado no input de dados (despesas e vendas por cidade), enquanto o administrador consulta o balanço consolidado quando necessário em aba dedicada e segura.

---

### 2. Experiência do Usuário & Ajustes Visuais

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WL SYSTEM - FLUXO AJUSTADO                      │
└────────────────────────────────────────────────────────────────────────┘

    PAINEL OPERACIONAL (TELA LIMPA)               RELATÓRIOS (RESTRITO ADM)
   ┌────────────────────────────────┐            ┌───────────────────────────┐
   │ BARRA LATERAL                  │            │ PAINEL DE INTELIGÊNCIA    │
   │  • Menu de Navegação           │            │  • Total Despesas         │
   │  • Status de Sincronização     │            │  • Faturamento Total      │
   │  [❌ Sem totais financeiros]   │            │  • Balanço DRE            │
   ├────────────────────────────────┤   ──────>  │  • Ranking de Cidades     │
   │ TELA DE LANÇAMENTOS            │            │  • Relatórios em PDF      │
   │  • Seleção de Categorias       │            └───────────────────────────┘
   │  • Últimos Lançamentos (lista) │                          ▲
   │  [❌ Sem cartão de mês atual]  │                          │
   └────────────────────────────────┘             Apenas perfil Administrador
```

- **Barra Lateral (`Sidebar`):**
  - Mantém o cabeçalho oficial da empresa e os itens de navegação rápida.
  - No rodapé da barra lateral, permanece apenas o selo discreto **"DADOS SINCRONIZADOS"** com ícone de banco de dados, eliminando os dois cartões pretos de `TOTAL MENSAL` e `TOTAL ACUMULADO`.
- **Tela de Lançamento (`NovoLancamentoView`):**
  - A coluna direita passa a focar nos **Últimos Lançamentos** recentes, removendo o card `RESUMO OPERACIONAL - MÊS ATUAL` que exibia a cifra total e a barra neon de progresso.

---

### 3. Decisões Técnicas & Arquitetura

- **Componente `Sidebar.tsx`:**
  - Remover a renderização condicional dos blocos `TOTAL MENSAL` e `TOTAL ACUMULADO`.
  - Simplificar as propriedades recebidas pelo componente.
- **Componente `NovoLancamentoView.tsx`:**
  - Remover o container de `RESUMO OPERACIONAL` com a métrica `currentMonthTotal`.
- **Orquestração `App.tsx`:**
  - Desacoplar os cálculos de totais do ciclo de renderização inicial do painel principal, mantendo a performance leve e os dados sensíveis encapsulados sob demanda no `ReportsView`.
- **Módulo de Relatórios (`ReportsView.tsx`):**
  - Preservado integralmente com proteção de permissão (`isAdmin`), garantindo que a análise financeira completa continue disponível para download em PDF e consulta executiva.
