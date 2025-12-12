import json
import os
from pathlib import Path
from typing import Optional

try:
    from apps.utils.config import STORAGE_DIR
except ImportError:
    from ..utils.config import STORAGE_DIR

class Budget:
    def __init__(self, pathname: str = "budget.json"):
        self.path = STORAGE_DIR / pathname
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def check_json(fun):
        """确保 Json 文件存在的装饰器"""
        def wrapper(self, *args, **kwargs):
            self.ensure_json()
            return fun(self, *args, **kwargs)
        return wrapper
    def ensure_json(self):
        """确保 JSON 文件存在，如果不存在则创建"""
        if not os.path.exists(self.path):
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump({"budget": {}}, f, ensure_ascii=False, indent=2)

    @check_json
    def write_budget(self, year: int, month: int, amount: float):
        """写入预算金额（按年份组织）"""
        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # 读取 budget 根节点
        budget_root = data.get("budget", {})
        # 如果该年不存在，则创建一个空列表
        year_str = str(year)
        if year_str not in budget_root:
            budget_root[year_str] = []
        # 取该年的预算列表
        year_list = budget_root[year_str]
        # 查找该月是否已存在
        for item in year_list:
            if item["month"] == month:
                item["monthlyLimit"] = amount
                break
        else:
            # 不存在 → 新增
            year_list.append({"month": month, "monthlyLimit": amount})
        # 回写
        data["budget"] = budget_root
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @check_json
    def read_budget(self, year: int, month: int) -> Optional[float]:
        """按年份与月份读取预算"""
        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)
        budget_root = data.get("budget", {})
        year_str = str(year)
        if year_str not in budget_root:
            return None
        for item in budget_root[year_str]:
            if item["month"] == month:
                return item.get("monthlyLimit")

        return None
    
    @check_json
    def read_last_budget(self):
        """读取最近一次设置的预算"""
        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)
        budget_root = data.get("budget", {})
        if not budget_root:
            return None
        # 获取最新的年份
        latest_year = max(budget_root.keys(), key=lambda y: int(y))
        year_list = budget_root[latest_year]
        if not year_list:
            return None
        # 获取最新的月份预算
        latest_month_item = max(year_list, key=lambda item: item["month"])
        return {
            "year": int(latest_year),
            "month": latest_month_item["month"],
            "monthlyLimit": latest_month_item.get("monthlyLimit", 0)
        }