

export interface ApiTransaction {
  date: string;
  event: string;
  amount: number;
  type: string;
  remark: string;
  category: string;
}

const BASE_URL = "http://localhost:5000/api";

/** 读取 CSV 中所有记录 */
export const fetchAllData = async () => {
  const res = await fetch(`${BASE_URL}/data`);
  return res.json();
};

/** 新增记录 */
export const addData = async (data: ApiTransaction) => {
  const res = await fetch(`${BASE_URL}/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

/** 删除记录 */
export const deleteData = async (id: string) => {
  const res = await fetch(`${BASE_URL}/data?id=${id}`, {
    method: "DELETE",
  });
  return res.json();
};

/** 设置预算 */
export const saveBudget = async (budget: { year : number ,month: number; monthlyLimit: number; enabled: boolean }) => {
  const res = await fetch(`${BASE_URL}/budget`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budget),
  });
  return res.json();
};

/** 读取预算 */
export const readBudget = async () => {
  const res = await fetch(`${BASE_URL}/budget`);
  return res.json();
};

/** 读取所有 TODO */
export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/todo`);
  return res.json();
};

/** 保存所有 TODO */
export const saveTodos = async (todos: import('./types').TodoItem[]) => {
  const res = await fetch(`${BASE_URL}/todo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todos),
  });
  return res.json();
};

/** 添加单个 TODO */
export const addTodo = async (todo: import('./types').TodoItem) => {
  const res = await fetch(`${BASE_URL}/todo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return res.json();
};

/** 删除单个 TODO */
export const deleteTodo = async (id: string) => {
  const res = await fetch(`${BASE_URL}/todo?id=${id}`, {
    method: "DELETE",
  });
  return res.json();
};

/** 更新单个 TODO */
export const updateTodo = async (id: string, updates: Partial<import('./types').TodoItem>) => {
  const res = await fetch(`${BASE_URL}/todo?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
};