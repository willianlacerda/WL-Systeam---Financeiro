import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { NovoLancamentoView } from './components/NovoLancamentoView';
import { LancamentoModal } from './components/LancamentoModal';
import { HistoricoView } from './components/HistoricoView';
import { VendasView } from './components/VendasView';
import { ReportsView } from './components/ReportsView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { LoginView } from './components/LoginView';
import { FinancialData, Expense, SubCategory, AppUser, Sale } from './types';
import { 
  fetchFinancialData, 
  saveFinancialData, 
  INITIAL_DATA,
  INITIAL_CITIES,
  normalizeExpense,
  normalizeSubCategory,
  normalizeAppUser,
  normalizeSale
} from './services/api';
import { subscribeToFirebaseFinancialData, getFirebaseFinancialData } from './services/firebase';

export const App: React.FC = () => {
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [activeTab, setActiveTab] = useState<ActiveTab>('lancar');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('wl_session_active');
  });

  const handleLogin = (user: AppUser) => {
    sessionStorage.setItem('wl_session_active', 'true');
    sessionStorage.setItem('wl_session_user', user.name);
    setIsAuthenticated(true);
    persist({
      ...data,
      settings: {
        ...data.settings!,
        currentUser: user.name,
        currentSetor: user.setor || (user.role === 'admin' ? 'Administrativo' : 'Operacional'),
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('wl_session_active');
    sessionStorage.removeItem('wl_session_user');
    setIsAuthenticated(false);
    setActiveTab('lancar');
  };

  // Modal for new expense launch
  const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string>('ÁGUA');

  // Load initial data & subscribe to real-time Cloud sync
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const loaded = await fetchFinancialData();
        if (isMounted) setData(loaded);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    // Sincronização em tempo real na nuvem entre celular e computador (.exe)
    const unsubscribe = subscribeToFirebaseFinancialData(
      (cloudData) => {
        if (!isMounted) return;
        setSyncStatus('synced');
        if (cloudData && (cloudData.expenses?.length || cloudData.sales?.length || cloudData.subCategories?.length)) {
          setData((prev) => ({
            ...cloudData,
            settings: {
              ...cloudData.settings,
              currentUser: prev.settings?.currentUser || cloudData.settings?.currentUser || 'Willian',
              currentSetor: prev.settings?.currentSetor || cloudData.settings?.currentSetor || 'Administrativo',
            }
          }));
        }
      },
      (err) => {
        console.warn('Erro na sincronização em tempo real:', err);
        if (isMounted) setSyncStatus('error');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleManualSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const cloud = await getFirebaseFinancialData();
      if (cloud) {
        setData((prev) => ({
          ...cloud,
          settings: {
            ...cloud.settings,
            currentUser: prev.settings?.currentUser || cloud.settings?.currentUser || 'Willian',
            currentSetor: prev.settings?.currentSetor || cloud.settings?.currentSetor || 'Administrativo',
          }
        }));
        setSyncStatus('synced');
      } else {
        await saveFinancialData(data);
        setSyncStatus('synced');
      }
    } catch (err) {
      console.error('Manual sync error:', err);
      setSyncStatus('error');
    }
  }, [data]);

  const persist = useCallback((newData: FinancialData) => {
    setData(newData);
    setSyncStatus('syncing');
    saveFinancialData(newData)
      .then(() => {
        setSyncStatus('synced');
      })
      .catch(err => {
        console.error('Failed to persist financial data:', err);
        setSyncStatus('error');
      });
  }, []);

  // Total Acumulado (all time)
  const totalAcumulado = useMemo(() => {
    return data.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [data.expenses]);

  // Current Month Total
  const currentMonthTotal = useMemo(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    return data.expenses
      .filter(e => e.date && e.date.startsWith(currentMonthKey))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [data.expenses]);

  // Current user & admin check
  const sessionUser = typeof window !== 'undefined' ? sessionStorage.getItem('wl_session_user') : null;
  const currentUser = sessionUser || data.settings?.currentUser || 'Willian';
  const isAdmin = useMemo(() => {
    const userObj = data.appUsers.find(
      u => u.name.toLowerCase() === currentUser.toLowerCase() || 
           (u as any).username?.toLowerCase() === currentUser.toLowerCase()
    );
    if (userObj) {
      return userObj.role === 'admin' || (userObj as any).role === 'master' || (userObj as any).pass === '7548';
    }
    return currentUser.toLowerCase().includes('willian') || currentUser.toLowerCase().includes('admin');
  }, [data.appUsers, currentUser]);

  // Se o usuário for operador de lançamento, não permitir acesso à aba de relatórios
  useEffect(() => {
    if (!isAdmin && activeTab === 'relatorios') {
      setActiveTab('lancar');
    }
  }, [isAdmin, activeTab]);



  const handleSelectUser = (user: AppUser) => {
    persist({
      ...data,
      settings: {
        ...data.settings!,
        currentUser: user.name,
        currentSetor: user.setor || (user.role === 'admin' ? 'Administrativo' : 'Operacional'),
      }
    });
  };

  // Clicked category button in grid
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategoryForModal(categoryName);
    setIsLancamentoModalOpen(true);
  };

  // Save new launch
  const handleSaveLancamento = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    persist({
      ...data,
      expenses: [newExp, ...data.expenses],
    });
  };

  // Toggle status (pago <-> pendente)
  const handleToggleStatus = (id: string) => {
    const updated = data.expenses.map(e => {
      if (e.id === id) {
        const nextStatus: Expense['status'] = e.status === 'pago' ? 'pendente' : 'pago';
        return { ...e, status: nextStatus };
      }
      return e;
    });
    persist({ ...data, expenses: updated });
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    if (!isAdmin) {
      alert('Acesso restrito: Usuários operadores não têm permissão para excluir lançamentos.');
      return;
    }
    const updated = data.expenses.filter(e => e.id !== id);
    persist({ ...data, expenses: updated });
  };

  // Sales management (Vendas & Faturamento)
  const handleSaveSale = (saleData: Omit<Sale, 'id'>, editId?: string) => {
    const currentSales = data.sales || [];
    if (editId) {
      const updated = currentSales.map(s => s.id === editId ? { ...s, ...saleData } : s);
      persist({ ...data, sales: updated });
    } else {
      const newSale: Sale = {
        ...saleData,
        id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      persist({ ...data, sales: [newSale, ...currentSales] });
    }
  };

  const handleDeleteSale = (id: string) => {
    if (!isAdmin) {
      alert('Acesso restrito: Usuários operadores não têm permissão para excluir lançamentos.');
      return;
    }
    const currentSales = data.sales || [];
    const updated = currentSales.filter(s => s.id !== id);
    persist({ ...data, sales: updated });
  };

  const handleToggleSaleStatus = (id: string) => {
    const currentSales = data.sales || [];
    const updated = currentSales.map(s => {
      if (s.id === id) {
        const nextStatus: Sale['status'] = s.status === 'recebido' ? 'a_receber' : 'recebido';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    persist({ ...data, sales: updated });
  };

  // Add / Rename / Delete Category button
  const handleAddCategory = (name: string) => {
    const newCat: SubCategory = {
      id: `cat-${Date.now()}`,
      name,
    };
    persist({
      ...data,
      subCategories: [...data.subCategories, newCat],
    });
  };

  const handleRenameCategory = (id: string, newName: string) => {
    const updated = data.subCategories.map(c => c.id === id ? { ...c, name: newName } : c);
    persist({ ...data, subCategories: updated });
  };

  const handleDeleteCategory = (idOrName: string) => {
    if (!isAdmin) {
      alert('Acesso restrito: Usuários operadores não têm permissão para excluir categorias.');
      return;
    }
    const target = (idOrName || '').trim().toUpperCase();
    const updated = data.subCategories.filter(
      c => c.id !== idOrName && c.name.trim().toUpperCase() !== target
    );
    persist({ ...data, subCategories: updated });
  };

  // Cities management (Vendas & Praças)
  const handleAddCity = (cityName: string) => {
    const currentCities = data.cities && data.cities.length > 0 ? data.cities : INITIAL_CITIES;
    const formatted = cityName.trim().toUpperCase();
    if (!currentCities.map(c => c.toUpperCase()).includes(formatted)) {
      persist({
        ...data,
        cities: [...currentCities, formatted].sort(),
      });
    }
  };

  const handleRenameCity = (oldName: string, newName: string) => {
    const currentCities = data.cities && data.cities.length > 0 ? data.cities : INITIAL_CITIES;
    const oldUpper = oldName.trim().toUpperCase();
    const newUpper = newName.trim().toUpperCase();
    const updated = currentCities.map(c => c.toUpperCase() === oldUpper ? newUpper : c);
    
    // Also update existing sales associated with that city
    const updatedSales = (data.sales || []).map(s => {
      if ((s.city || '').toUpperCase() === oldUpper) {
        return { ...s, city: newUpper };
      }
      return s;
    });

    persist({
      ...data,
      cities: updated.sort(),
      sales: updatedSales,
    });
  };

  const handleDeleteCity = (cityName: string) => {
    if (!isAdmin) {
      alert('Acesso restrito: Usuários operadores não têm permissão para excluir cidades.');
      return;
    }
    const currentCities = data.cities && data.cities.length > 0 ? data.cities : INITIAL_CITIES;
    const targetUpper = cityName.trim().toUpperCase();
    const updated = currentCities.filter(c => c.toUpperCase() !== targetUpper);
    persist({
      ...data,
      cities: updated,
    });
  };

  // Users management
  const handleAddUser = (user: Omit<AppUser, 'id'>) => {
    if (!isAdmin) {
      alert('Acesso restrito: Somente usuários administradores podem criar novos usuários.');
      return;
    }
    const newUser: AppUser = {
      ...user,
      id: `usr-${Date.now()}`,
    };
    persist({
      ...data,
      appUsers: [...data.appUsers, newUser],
    });
  };

  const handleUpdateUser = (user: AppUser) => {
    if (!isAdmin) {
      alert('Acesso restrito: Somente usuários administradores podem alterar usuários.');
      return;
    }
    const updated = data.appUsers.map(u => u.id === user.id ? user : u);
    persist({ ...data, appUsers: updated });
  };

  const handleDeleteUser = (id: string) => {
    if (!isAdmin) {
      alert('Acesso restrito: Somente usuários administradores podem excluir usuários.');
      return;
    }
    const updated = data.appUsers.filter(u => u.id !== id);
    persist({ ...data, appUsers: updated });
  };

  // Backup handlers
  const handleBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_wl_system_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            if (parsed && Array.isArray(parsed.expenses)) {
              const normalizedData: FinancialData = {
                expenses: parsed.expenses.map(normalizeExpense),
                subCategories: Array.isArray(parsed.subCategories) 
                  ? parsed.subCategories.map(normalizeSubCategory) 
                  : data.subCategories,
                appUsers: Array.isArray(parsed.appUsers) 
                  ? parsed.appUsers.map(normalizeAppUser) 
                  : data.appUsers,
                sales: Array.isArray(parsed.sales)
                  ? parsed.sales.map(normalizeSale)
                  : (data.sales || []),
                cities: Array.isArray(parsed.cities)
                  ? parsed.cities
                  : (data.cities || INITIAL_CITIES),
                settings: parsed.settings || data.settings || {
                  companyName: 'WL SYSTEM',
                  currentUser: 'Willian',
                  currentSetor: 'Administrativo',
                  logoUrl: '/logo.png'
                }
              };

              if (parsed.customLogo) {
                try {
                  await fetch('/api/logo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataBase64: parsed.customLogo })
                  });
                } catch {}
              }

              persist(normalizedData);
              alert(`Backup importado com sucesso! ${normalizedData.expenses.length} lançamentos e ${normalizedData.subCategories.length} categorias carregadas.`);
            } else {
              alert('Formato de backup inválido.');
            }
          } catch (err) {
            alert('Erro ao processar o arquivo de backup.');
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  // Titles
  const tabTitles: Record<ActiveTab, string> = {
    lancar: 'Lançar Despesa',
    vendas: 'Lança Venda',
    historico: 'Consulta de Histórico',
    relatorios: 'Inteligência & Relatórios',
    configuracoes: 'Configurações do Sistema',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-zinc-300">CARREGANDO WL SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        appUsers={data.appUsers}
        onLogin={handleLogin}
        companyName={data.settings?.companyName}
        logoUrl={data.settings?.logoUrl || "/logo.png"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100 flex overflow-hidden">
      
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalAcumulado={totalAcumulado}
        totalMensal={currentMonthTotal}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0b0c0e]">
        
        {/* Top Header */}
        <Header
          title={tabTitles[activeTab]}
          setor={data.settings?.currentSetor || (isAdmin ? 'Administrativo' : 'Operacional')}
          usuario={currentUser}
          isAdmin={isAdmin}
          syncStatus={syncStatus}
          onManualSync={handleManualSync}
          onLogout={handleLogout}
        />

        {/* View Body */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {activeTab === 'lancar' && (
            <NovoLancamentoView
              categories={data.subCategories}
              expenses={data.expenses}
              onSelectCategory={handleSelectCategory}
              onViewAllExpenses={() => setActiveTab('historico')}
              currentMonthTotal={currentMonthTotal}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'historico' && (
            <HistoricoView
              expenses={data.expenses}
              sales={data.sales || []}
              onDeleteExpense={handleDeleteExpense}
              onDeleteSale={handleDeleteSale}
              onToggleStatus={handleToggleStatus}
              settings={data.settings}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'vendas' && (
            <VendasView
              sales={data.sales || []}
              expenses={data.expenses}
              settings={data.settings}
              currentUser={currentUser}
              cities={data.cities || INITIAL_CITIES}
              onSaveSale={handleSaveSale}
              onDeleteSale={handleDeleteSale}
              onToggleSaleStatus={handleToggleSaleStatus}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'relatorios' && (
            isAdmin ? (
              <div className="p-4 sm:p-6">
                <ReportsView
                  expenses={data.expenses}
                  sales={data.sales || []}
                  cities={data.cities || INITIAL_CITIES}
                  subCategories={data.subCategories}
                  appUsers={data.appUsers}
                  settings={{
                    companyName: data.settings?.companyName || 'WL SYSTEM',
                    currency: 'BRL',
                  }}
                />
              </div>
            ) : (
              <div className="p-8 max-w-md mx-auto text-center space-y-3">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 font-semibold text-xs">
                  Acesso Restrito: Usuários operadores não têm permissão para visualizar relatórios.
                </div>
              </div>
            )
          )}

          {activeTab === 'configuracoes' && (
            <ConfiguracoesView
              categories={data.subCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              cities={data.cities || INITIAL_CITIES}
              onAddCity={handleAddCity}
              onDeleteCity={handleDeleteCity}
              onRenameCity={handleRenameCity}
              expenses={data.expenses}
              sales={data.sales || []}
              appUsers={data.appUsers}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onBackup={handleBackup}
              onImportBackup={handleImportBackup}
              settings={data.settings}
              isAdmin={isAdmin}
            />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
      />

      {/* Modal for new launch */}
      <LancamentoModal
        isOpen={isLancamentoModalOpen}
        onClose={() => setIsLancamentoModalOpen(false)}
        categoryName={selectedCategoryForModal}
        onSave={handleSaveLancamento}
        currentUser={data.settings?.currentUser || 'Willian'}
        currentSetor={data.settings?.currentSetor || 'Administrativo'}
      />

    </div>
  );
};

export default App;
