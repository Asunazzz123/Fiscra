import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, List, Settings, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Ledger } from './components/Ledger';
import { EntryForm } from './components/EntryForm';
import { Transaction, BudgetSettings, AppView, isValidYear } from './types';
import { analyzeSpending } from './services/geminiService';
import { fetchAllData, addData, deleteData,  saveBudget, readBudget } from './api';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudgetState] = useState<BudgetSettings>({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1, 
    monthlyLimit: 2000, 
    enabled: true 
  });
  const [isBudgetHydrated, setBudgetHydrated] = useState(false);
  const [hasHydratedBudget, setHasHydratedBudget] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // 用于刷新状态指示

  // 提取数据获取函数
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchAllData();
      if (res.status === "ok") {
        setTransactions(res.data as Transaction[]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // 可以添加用户通知
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  //  初次加载 & 定时轮询
  useEffect(() => {
    // 初次加载数据
    refreshData();

    const hydrateBudget = async () => {
      let hydrated = false;

      try {
        const response = await readBudget();
        if (response?.status === "ok" && response.data) {
          setBudgetState(response.data as BudgetSettings);
          localStorage.setItem("brightledger_budget", JSON.stringify(response.data));
          hydrated = true;
        }
      } catch (error) {
        console.error("Failed to load budget from API:", error);
      }

      if (!hydrated) {
        try {
          const savedBudget = localStorage.getItem("brightledger_budget");
          if (savedBudget) {
            setBudgetState(JSON.parse(savedBudget));
            hydrated = true;
          }
        } catch (error) {
          console.error("Failed to parse budget from local storage:", error);
        }
      }

      setBudgetHydrated(true);
    };

    hydrateBudget();

    // 设置定时器轮询一次数据
    const intervalId = setInterval(() => {
        refreshData();
    }, 1000*60*3); // 3 minutes

    // 清理函数：在组件卸载时清除定时器，避免内存泄漏
    return () => clearInterval(intervalId);
  }, [refreshData]);

  // budget 改变时保存到后端
  useEffect(() => {
    if (!isBudgetHydrated) return;

    localStorage.setItem("brightledger_budget", JSON.stringify(budget));

    if (!hasHydratedBudget) {
      setHasHydratedBudget(true);
      return;
    }
    // 校验年份必须是四位数，否则不触发后端保存
    if (!isValidYear(budget.year)) {
      return;
    }
    // 用户停止输入 500ms 后才保存到后端
    const timeoutId = setTimeout(async () => {
      try {
        await saveBudget(budget);
      } catch (error) {
        console.error("Failed to persist budget settings:", error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [budget, hasHydratedBudget, isBudgetHydrated]);

  // 添加交易（新增或编辑）
  const handleAddTransaction = async (data: Omit<Transaction, "id">) => {
    if (editingId) {
      // 前端编辑（CSV 无编辑接口，只能删除后添加）
      await deleteData(editingId);
      await addData(data);
      setEditingId(null);
    } else {
      await addData(data);
    }

    // 操作完成后，手动刷新数据（覆盖轮询的延迟）
    refreshData(); 
  };

  // 删除交易
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    await deleteData(id);

    // 操作完成后，手动刷新数据
    refreshData();
  };

  // 编辑
  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setIsFormOpen(true);
  };

  // 导入数据
  const importData = (data: Transaction[]) => {
    setTransactions(prev => [...data, ...prev]);
    alert(`Successfully imported ${data.length} transactions.`);
  };

  // AI 分析
  const triggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    const month = new Date().toISOString().slice(0, 7);
    const result = await analyzeSpending(transactions, month);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-30">
        <div className="font-bold text-xl text-blue-600 tracking-tight">BrightLedger</div>
        <button
          onClick={() => { setEditingId(null); setIsFormOpen(true); }}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6">
           <div className="font-bold text-2xl text-blue-600 tracking-tight flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">F</div>
             Fiscra
           </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              view === AppView.DASHBOARD ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setView(AppView.LEDGER)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              view === AppView.LEDGER ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Transactions</span>
          </button>

          <button 
            onClick={() => setView(AppView.AI_INSIGHTS)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              view === AppView.AI_INSIGHTS ? 'bg-purple-50 text-purple-700 font-medium'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Advisor</span>
          </button>

          <button 
            onClick={() => setView(AppView.SETTINGS)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              view === AppView.SETTINGS ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Budget Settings</span>
          </button>
        </nav>

        <div className="p-6">
          <button 
            onClick={() => { setEditingId(null); setIsFormOpen(true); }}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {view === AppView.DASHBOARD && 'Financial Overview'}
              {view === AppView.LEDGER && 'Transaction History'}
              {view === AppView.SETTINGS && 'Budget Configuration'}
              {view === AppView.AI_INSIGHTS && 'Smart Analysis'}
            </h1>
            
            {(view === AppView.DASHBOARD || view === AppView.LEDGER) && (
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                title="Manually refresh data from CSV file"
              >
                <RefreshCw 
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            )}
          </header>

          {/* Views */}
          {view === AppView.DASHBOARD && (
            <Dashboard transactions={transactions} budget={budget} />
          )}

          {view === AppView.LEDGER && (
            <Ledger
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onEdit={startEdit}
              onImport={importData}
            />
          )}

          {view === AppView.SETTINGS && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-lg">
              {/* Budget UI  */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium text-slate-700">Enable Monthly Budget</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={budget.enabled}
                    onChange={(e) => setBudgetState({ ...budget, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600">
                    <div className="w-5 h-5 bg-white rounded-full transform transition-all peer-checked:translate-x-5 mt-[2px] ml-[2px]"></div>
                  </div>
                </label>
              </div>
              <div className={`bg-gray-100 p-6 rounded-2xl mb-6 ${budget.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Year and Month
                </label>
                <input
                  type="number"
                  value={budget.year}
                  onChange={(e) => setBudgetState({ ...budget, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-[40%] mr-4 px-4 py-2 border border-slate-200 rounded-lg"
                ></input>
                <select
                  value={budget.month}
                  onChange={(e) => setBudgetState({ ...budget, month: Number(e.target.value) })}
                  className="w-[40%] px-4 py-2 border border-slate-200 rounded-lg"
                >
                  {[...Array(12)].map((_, index) => {
                    const month = index + 1;
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={`${budget.enabled ? "" : "opacity-50 pointer-events-none"}`}>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  value={budget.monthlyLimit}
                  onChange={(e) => setBudgetState({ ...budget, monthlyLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {view === AppView.AI_INSIGHTS && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              
              <button 
                onClick={triggerAIAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze My Spending"}
              </button>

              {aiAnalysis && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                  <pre>{aiAnalysis}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around py-3 z-30">
        <button onClick={() => setView(AppView.DASHBOARD)}>
          <LayoutDashboard className={`w-6 h-6 ${view === AppView.DASHBOARD ? 'text-blue-600' : 'text-slate-400'}`} />
        </button>
        <button onClick={() => setView(AppView.LEDGER)}>
          <List className={`w-6 h-6 ${view === AppView.LEDGER ? 'text-blue-600' : 'text-slate-400'}`} />
        </button>
        <button onClick={() => setView(AppView.AI_INSIGHTS)}>
          <Sparkles className={`w-6 h-6 ${view === AppView.AI_INSIGHTS ? 'text-purple-600' : 'text-slate-400'}`} />
        </button>
        <button onClick={() => setView(AppView.SETTINGS)}>
          <Settings className={`w-6 h-6 ${view === AppView.SETTINGS ? 'text-blue-600' : 'text-slate-400'}`} />
        </button>
      </nav>

      {/* Modal Form */}
      <EntryForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingId(null); }}
        onSubmit={handleAddTransaction}
        initialData={editingId ? transactions.find(t => t.id === editingId) : null}
      />
    </div>
  );
};

export default App;