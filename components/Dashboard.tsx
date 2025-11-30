import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Transaction, BudgetSettings } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budget: BudgetSettings;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, budget }) => {
  const currentDate = new Date();
  const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const stats = useMemo(() => {
    const currentMonthTx = transactions.filter(t => t.date?.startsWith(currentMonthStr));
    const totalIncome = currentMonthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = currentMonthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { totalIncome, totalExpense, currentMonthTx };
  }, [transactions, currentMonthStr]);

  const chartData = useMemo(() => {
    // Daily Consumption Line Chart
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
      const dailyExpense = stats.currentMonthTx
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { day: `Day ${day}`, amount: dailyExpense };
    });

    // Category Pie Chart
    const categoryMap = new Map<string, number>();
    stats.currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });
    
    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    return { dailyData, categoryData };
  }, [stats, currentMonthStr, currentDate]);

  const budgetAlert = budget.enabled && stats.totalExpense > budget.monthlyLimit;
  const budgetPercent = budget.enabled ? Math.min(100, (stats.totalExpense / budget.monthlyLimit) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Monthly Income</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">${stats.totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Monthly Expense</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">${stats.totalExpense.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${budgetAlert ? 'bg-red-100' : 'bg-blue-100'}`}>
              <Wallet className={`w-5 h-5 ${budgetAlert ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Budget Status</h3>
          </div>
          {budget.enabled ? (
            <>
              <div className="flex justify-between items-end mb-1">
                 <p className={`text-2xl font-bold ${budgetAlert ? 'text-red-600' : 'text-slate-800'}`}>
                  {budgetPercent.toFixed(1)}%
                </p>
                <span className="text-xs text-slate-400">Limit: ${budget.monthlyLimit}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${budgetAlert ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
              {budgetAlert && (
                 <div className="mt-2 flex items-center text-xs text-red-500 font-medium">
                   <AlertTriangle className="w-3 h-3 mr-1" /> Over Budget!
                 </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm mt-2">Budget not set</p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Spending ({currentMonthStr})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense by Category</h3>
          <div className="h-64">
             {chartData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                  <Legend 
                     verticalAlign="bottom" 
                     height={36} 
                     iconType="circle"
                     formatter={(value) => <span className="text-xs text-slate-600 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                 No expenses recorded this month.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
