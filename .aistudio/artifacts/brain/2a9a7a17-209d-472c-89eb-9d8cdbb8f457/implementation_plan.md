# Arquitetura de Responsividade Mobile & Experiência Touch (WL System)

Plano abrangente para transformar o WL System em uma aplicação fluida, intuitiva e ergonômica em smartphones e telas sensíveis ao toque, adotando navegação inferior estilo aplicativo nativo, cartões compactos e gavetas inferiores (bottom sheets) acessíveis com o polegar.

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> As seguintes escolhas foram alinhadas diretamente nas respostas das perguntas de esclarecimento:
> - **Navegação Principal**: Barra de navegação inferior fixa (`Bottom Navigation Bar`) no celular, com ícones e rótulos acessíveis ao polegar, ocultando a barra lateral tradicional em telas `< md`.
> - **Visualização de Despesas e Vendas**: Cartões compactos e responsivos (`Mobile Tap Cards`) com ações rápidas por toque, substituindo tabelas horizontais apertadas em telas pequenas.
> - **Modais de Cadastro e Lançamento**: Formato de gaveta inferior deslizante (`Bottom Sheet`) com cantos superiores arredondados e botão de confirmação fixado na área natural do polegar.

---

## 1. Visão Geral e Experiência do Usuário (Mobile & Desktop)

O WL System manterá sua experiência completa em desktop e notebooks, adaptando-se de forma inteligente e contínua em telas menores:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPERIÊNCIA MULTIDISPOSITIVO                    │
├────────────────────────────────────┬───────────────────────────────────┤
│        DESKTOP (>= 768px)          │        SMARTPHONE (< 768px)       │
├────────────────────────────────────┼───────────────────────────────────┤
│ • Barra lateral expansível/recolh. │ • Barra fixa inferior (BottomNav) │
│ • Header completo com alternância  │ • Header compacto com saldo/badge │
│ • Tabelas detalhadas multicolunas  │ • Lista de cartões táteis         │
│ • Modais flutuantes centralizados  │ • Bottom sheets com arrasto       │
│ • Resumos em grid de 3 a 5 colunas │ • Grids fluidos (1 a 2 colunas)   │
└────────────────────────────────────┴───────────────────────────────────┘
```

---

## 2. Padrões de Interface & Ergonomia Touch

### A. Barra Inferior de Navegação (Bottom Navigation Bar)
- Fixada no rodapé da viewport em dispositivos móveis (`fixed bottom-0 inset-x-0 z-40`).
- Altura controlada com suporte a área segura (`pb-safe`) e backdrop blur escuro elegante.
- Destinos principais rápidos:
  1. **Lançar** (Ícone de Adição/Raio)
  2. **Histórico** (Ícone de Lista/Arquivo)
  3. **Vendas** (Ícone de Carrinho/Sacola)
  4. **Relatórios** (Ícone de Gráfico — visível apenas para administradores)
  5. **Config** (Ícone de Engrenagem/Usuário)
- Hitbox mínima de toque de **$48 \times 48\text{px}$** para evitar toques acidentais.

### B. Header Móvel Compacto
- Altura contida entre $52\text{px}$ e $56\text{px}$ (`sticky top-0 z-30`).
- Mostra o logotipo compacto WL System, o nome do operador ativo com badge discreto de perfil (`Admin` ou `Op`), e botão de troca rápida de usuário ou logout sem poluir a visão.
- Respeita o teto de $15\%$ de ocupação fixa na tela para deixar $85\%$ do espaço livre para os dados financeiros.

### C. Cartões de Lançamento e Vendas (Mobile Cards)
- Em telas pequenas, as tabelas de histórico e vendas alternam automaticamente para cartões individuais:
  - **Topo do card**: Data formatada e Categoria/Cliente com tipografia limpa (sem badge pílula estático).
  - **Valor**: Destaque em números tabulares (`font-mono font-bold text-lg`), com diferenciação visual entre Despesa (vermelho/laranja) e Venda/Receita (verde esmeralda).
  - **Status & Ações**: Botão de alternar status (Pago/Pendente ou Recebido/A Receber) e botão de excluir/editar com área de toque de fácil alcance.

### D. Bottom Sheets para Formulários (Lançamentos e Vendas)
- Modais de cadastro de despesa, venda e edição se abrem como folhas inferiores (`rounded-t-3xl` com animação suave de subida).
- Barra sutil de arrasto no topo (`w-10 h-1.5 bg-neutral-700 rounded-full mx-auto my-3`).
- Teclado numérico otimizado (`inputMode="decimal"` ou `inputMode="numeric"`) no campo de valor.
- Botão "Salvar Lançamento" de largura total, fixado na zona do polegar.

---

## 3. Diagrama de Arquitetura de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│                   (activeTab, isAdmin, data, persist)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   Header (Compact)   │ │  Main View Container │ │ BottomNav (Mobile)   │
│  • Logo + User Mini  │ │  • NovoLancamento    │ │  • 4 a 5 Abas Touch  │
│  • Badges adaptivos  │ │  • HistoricoView     │ │  • Ativa apenas em   │
│  • Apenas top sticky │ │  • VendasView        │ │    telas mobile      │
└──────────────────────┘ │  • ConfiguracoesView │ └──────────────────────┘
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴───────────┐
                         ▼                      ▼
               ┌──────────────────┐   ┌──────────────────┐
               │ Responsive Table │   │   Bottom Sheet   │
               │ (Table em desktop│   │  (LancamentoModal│
               │  Cards em mobile)│   │   SaleModal etc.)│
               └──────────────────┘   └──────────────────┘
```

---

## 4. Plano de Implementação por Etapa

1. **Navegação & Layout Base (`App.tsx`, `Sidebar.tsx`, novo `BottomNav.tsx`)**:
   - Criar componente `BottomNav` dedicado com suporte ao perfil `isAdmin` e abas ativas.
   - Ocultar a `Sidebar` desktop em telas `< md` (`hidden md:flex`).
   - Adicionar espaçamento inferior seguro (`pb-20 md:pb-6`) no contêiner principal para não cobrir conteúdo com a barra fixa.

2. **Cabeçalho Móvel (`Header.tsx`)**:
   - Reorganizar elementos do cabeçalho com flex-wrap inteligente e padding responsivo (`px-3 md:px-6`).
   - Reduzir textos longos em telas pequenas para evitar quebras desnecessárias.

3. **Formulários e Grid de Lançamento (`NovoLancamentoView.tsx`)**:
   - Ajustar o grid de botões de categorias para `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`, facilitando o toque em qualquer tamanho de aparelho.
   - Adicionar campo de busca rápida de categorias no celular.

4. **Histórico e Vendas (`HistoricoView.tsx`, `VendasView.tsx`, `ExpensesTable.tsx`)**:
   - Implementar renderização condicional/responsiva: tabela tradicional em `md:` e lista de cartões táteis em `< md`.
   - Filtros de período e pesquisa em linha colapsável ou compacta no celular.

5. **Modais de Ação (`LancamentoModal.tsx`, `SaleModal.tsx`, etc.)**:
   - Adaptar os contêineres de modal para atuarem como gavetas inferiores (`fixed inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh] overflow-y-auto md:relative md:rounded-2xl`).

---

## 5. Plano de Verificação

1. **Responsividade Mobile (375px - 430px)**:
   - A barra inferior deve permanecer fixa e acessível.
   - Os cards de despesas e vendas devem ser legíveis, sem corte de texto ou rolagem horizontal da página inteira.
   - O modal de lançamento deve deslizar de baixo, com campos preenchíveis sem estourar o layout.
2. **Preservação Desktop (>= 1024px)**:
   - A barra lateral desktop e as tabelas completas continuam intactas e funcionais.
3. **Compilação e Qualidade**:
   - Executar `compile_applet` e garantir zero erros de TypeScript e build.
