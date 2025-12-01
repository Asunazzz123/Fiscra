import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { X } from 'lucide-react';

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
}

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Investment', 'Gift', 'Other'];

export const EntryForm: React.FC<EntryFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Food',
    remark: ''
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                date: initialData.date,
                event: initialData.event,
                amount: initialData.amount.toString(),
                type: initialData.type,
                category: initialData.category,
                remark: initialData.remark || ''
            });
        } else {
            // Reset
            setFormData({
                date: new Date().toISOString().split('T')[0],
                event: '',
                amount: '',
                type: 'expense',
                category: 'Food',
                remark: ''
            });
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    onClose();
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'expense' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Event Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery shopping"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-500 mb-1">remark (Optional)</label>
             <textarea 
               className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-20"
               value={formData.remark}
               onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
             />
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors mt-2"
          >
            {initialData ? 'Save Changes' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};
