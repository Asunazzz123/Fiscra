import React, { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Calendar, Flag, Search, Filter } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoProps {
  todos: TodoItem[];
  onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoItem>) => void;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];
const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
};

export const TODO: React.FC<TodoProps> = ({ todos, onAdd, onToggle, onDelete, onUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: 'Personal'
  });

  // 筛选和排序
  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || 
                              (filterStatus === 'completed' && todo.completed) ||
                              (filterStatus === 'active' && !todo.completed);
        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        // 未完成的排在前面
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // 按优先级排序
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [todos, searchTerm, filterPriority, filterStatus]);

  // 统计信息
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
    return { total, completed, active, highPriority };
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    
    onAdd({
      ...newTodo,
      completed: false
    });
    
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'Personal'
    });
    setIsFormOpen(false);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* 优先级筛选 */}
            <select
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            {/* 状态筛选 */}
            <select
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* 添加按钮 */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* TODO 列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredTodos.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-1">Add a new task to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTodos.map(todo => (
              <li
                key={todo.id}
                className={`p-4 hover:bg-slate-50 transition-colors ${todo.completed ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* 完成按钮 */}
                  <button
                    onClick={() => onToggle(todo.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-blue-500'
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </button>
                  
                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {todo.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                        {todo.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {todo.category}
                      </span>
                    </div>
                    
                    {todo.description && (
                      <p className={`text-sm mt-1 ${todo.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                        {todo.description}
                      </p>
                    )}
                    
                    {todo.dueDate && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${
                        isOverdue(todo.dueDate) && !todo.completed ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>Due: {todo.dueDate}</span>
                        {isOverdue(todo.dueDate) && !todo.completed && <span className="font-medium">(Overdue)</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 添加表单弹窗 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">New Task</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <textarea
                  placeholder="Add details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-20"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
