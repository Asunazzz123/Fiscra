

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
export const setBudget = async (budget: { monthlyLimit: number; enabled: boolean }) => {
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