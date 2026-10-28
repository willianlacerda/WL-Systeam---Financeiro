# Controle de Acesso Baseado em Nível Operacional (RBAC) & Privacidade de Dados Financeiros

Implementação de políticas de privacidade e controle de acesso estrito no WL System, garantindo que apenas usuários com nível **Administrador Geral** tenham acesso à aba de Relatórios, exportação de PDF e visualização dos cartões de saldo e faturamento consolidado, mantendo a experiência do **Operador de Lançamento** focada e segura.

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> As seguintes diretrizes foram alinhadas diretamente nas respostas das perguntas de esclarecimento:
> - **Visualização de Totais e Saldos**: Ocultar completamente os cards de saldo, faturamento e totais consolidados para operadores de lançamento.
> - **Entrada de Dados (Formulários)**: O operador pode visualizar o valor que está digitando no momento do cadastro da despesa ou venda.
> - **Aba de Relatórios & PDF**: Ocultar por completo a aba "Relatórios" na barra lateral e todos os botões de exportação de PDF para operadores.

---

## 1. Visão Geral e Experiência do Usuário

O sistema agora terá comportamentos visuais e funcionais distintos com base no nível do usuário ativo:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PERFIS DE ACESSO                              │
├────────────────────────────────────┬───────────────────────────────────┤
│    ADMINISTRADOR GERAL             │     OPERADOR DE LANÇAMENTO        │
├────────────────────────────────────┼───────────────────────────────────┤
│ • Acesso irrestrito a todas abas   │ • Acesso: Lançar Despesa, Lança   │
│ • Visualização de faturamento,     │   Venda e Histórico de Entradas   │
│   saldo líquido e métricas globais │ • Cards de saldo e faturamento    │
│ • Exportação de relatórios em PDF  │   consolidados OCULTADOS          │
│ • Acesso completo à aba Relatórios │ • Aba Relatórios OCULTADA         │
│ • Gestão de usuários e backups     │ • Botões de baixar PDF OCULTADOS  │
│                                    │ • Pode digitar valor no registro  │
└────────────────────────────────────┴───────────────────────────────────┘
```

---

## 2. Fluxo de Navegação e Regras por Tela

### A. Barra Lateral (Sidebar) & Cabeçalho (Header)
- **Menu Lateral**:
  - Item "Relatórios" renderizado exclusivamente quando `isAdmin === true`.
  - Cards de "Total Acumulado" e "Total Mês Atual" no rodapé da Sidebar renderizados exclusivamente para administradores.
- **Header**:
  - Exibe o nome do usuário com badge explícito de nível operacional (`Administrador Geral` ou `Operador de Lançamento`).
  - Botão de alternância rápida de operador/administrador para facilitar testes e transição de turnos.

### B. Histórico de Lançamentos (`HistoricoView`)
- **Cartões de Resumo no Topo**: Os cards "Total Vendas", "Total Despesas" e "Saldo Líquido do Período" serão completamente ocultados para operadores.
- **Exportação de PDF**: Botão "Exportar Relatório PDF" ocultado para operadores.
- **Tabela de Lançamentos**: O operador visualiza os lançamentos para conferência operacional.

### C. Lança Venda (`VendasView`)
- **Painel Superior de Faturamento**: Cards agregadores (Receita Total, Ticket Médio, Previsão de Entradas) renderizados apenas para administradores.
- **Formulário de Venda**: Permanece 100% acessível para lançamento com visualização do valor digitado pelo operador.

### D. Aba de Relatórios (`RelatoriosView`)
- Proteção de rota interna: se um operador tentar acessar a URL/estado `relatorios`, o sistema redireciona automaticamente para a aba `lancar`.

---

## 3. Arquitetura Técnica & Mapeamento de Estados

```
              ┌──────────────────────────────────────┐
              │              App.tsx                 │
              │  (currentUser, isAdmin, appUsers)    │
              └───────────────┬──────────────────────┘
                              │
       ┌──────────────────────┼───────────────────────┐
       ▼                      ▼                       ▼
┌──────────────┐      ┌──────────────┐        ┌──────────────┐
│   Sidebar    │      │    Header    │        │ HistoricoView│
│  (isAdmin)   │      │ (role badge) │        │  (isAdmin)   │
└──────────────┘      └──────────────┘        └──────────────┘
  • Oculta tab          • Badge de nível        • Oculta cards
    Relatórios            no perfil               de saldo
  • Oculta cards        • Troca de usuário      • Oculta botão
    de totais                                     PDF
```

### Propriedades e Componentes Impactados:
1. `src/components/Sidebar.tsx`:
   - Filtrar item `relatorios` na navegação se `!isAdmin`.
   - Condicionar a exibição dos blocos de Total Acumulado e Total Mensal a `isAdmin`.
2. `src/components/HistoricoView.tsx`:
   - Receber `isAdmin?: boolean`.
   - Ocultar botões de download de PDF e filtros de exportação se `!isAdmin`.
   - Ocultar os cards de métricas agregadas de faturamento e saldo para operadores.
3. `src/components/VendasView.tsx`:
   - Receber `isAdmin?: boolean`.
   - Ocultar cards de métricas financeiras globais para operadores.
4. `src/components/Header.tsx`:
   - Exibir badge do nível atual (`Administrador Geral` ou `Operador`).
   - Modal/seletor amigável para alternar usuário conectado.
5. `src/App.tsx`:
   - Garantir propagação consistente de `isAdmin` para todas as views e guards de aba.

---

## 4. Plano de Verificação

1. **Teste de Administrador**:
   - Logado como "Willian" (Administrador Geral): Todas as abas visíveis, cards de faturamento, saldo líquido e relatórios PDF totalmente operacionais.
2. **Teste de Operador de Lançamento**:
   - Alternar para "Operador Padrão":
     - Aba Relatórios não aparece na barra lateral.
     - Botões de exportar PDF no Histórico somem da interface.
     - Cards de Total Acumulado, Total Mensal, Saldo Líquido e Faturamento somem das telas.
     - Operador consegue lançar despesas e vendas normalmente digitando os valores.
3. **Build & Lint**:
   - Executar `lint_applet` e `compile_applet` sem erros.
