# Plano de Implementação: Ocultar Valores Sensíveis para Operador de Lançamento

## 1. Visão Geral e Decisões Alinhadas com o Usuário
Conforme alinhado através das perguntas de clarificação:
- **Total Mensal e Total Acumulado (Barra Lateral):** Os blocos com os valores totais acumulados da empresa exibidos na barra lateral (destacados na imagem enviada) serão **completamente ocultados** para usuários com o perfil `operador` (Operador de Lançamento). Apenas administradores terão visibilidade.
- **Resumos Consolidados e Balanço DRE:** O card de **Resumo Operacional (Mês Atual)** na tela inicial de despesas, o card de **Faturamento do Mês / Total Acumulado Geral** e o card de **Balanço DRE do Mês (Vendas vs Despesas / Lucro ou Prejuízo)** na tela de vendas serão restritos exclusivamente ao perfil `admin`.
- **Lançamentos Individuais Preservados:** Os lançamentos operacionais individuais (despesas e vendas recentes no histórico e na tela de lançamento) continuam visíveis para permitir o trabalho diário de registro operacional.

---

## 2. Modificações nos Componentes e Arquitetura

### 1. `src/components/Sidebar.tsx`
- **Total Mensal e Total Acumulado:** Condicionar a exibição dos cards de `TOTAL MENSAL` e `TOTAL ACUMULADO` ao `isAdmin`.
- Para operadores, os blocos com os valores totais consolidados não serão renderizados, mantendo o status de sincronização limpo.

### 2. `src/components/NovoLancamentoView.tsx`
- **Card "Resumo Operacional":** Condicionar o card que exibe o total acumulado do mês (`currentMonthTotal`) e a barra de progresso ao `isAdmin`.
- Para o operador, a grade de seleção de despesas e os lançamentos recentes continuam funcionais e limpos sem expor o montante financeiro da empresa.

### 3. `src/components/VendasView.tsx`
- **Card Faturamento do Mês (Vendas):** Exibir somente para `isAdmin`.
- **Card Balanço DRE do Mês (Vendas vs Despesas):** Exibir somente para `isAdmin`.
- A lista de cidades para lançamento de vendas e as vendas recentes permanecem acessíveis para o operador registrar novas vendas.

---

## 3. Plano de Verificação e Testes
1. **Verificação de Compilação & Tipagem:**
   - Executar `lint_applet` para validação sem erros de TypeScript.
   - Executar `compile_applet` para certificar integridade do build Vite/React.
2. **Validação de Interface (Admin vs Operador):**
   - Usuário Administrador (`admin`): Visualiza todos os totais na Sidebar, Resumo Operacional e Balanço DRE.
   - Usuário Operador (`operador`): Não visualiza nenhum dos blocos de totais ou DRE, preservando o sigilo de dados financeiros consolidados.
