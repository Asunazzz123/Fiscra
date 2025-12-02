import json
import os


class Budget:
    def __init__(self, path: str, month: int):
        self.path = path
        self.month = month
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
    def write_budget(self, amount: float, month: int):
        """写入预算金额"""
        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        existing_budget = data.get("budget", {})
        if isinstance(existing_budget, list):
            # 兼容旧版列表结构
            budget_map = {}
            for item in existing_budget:
                month_value = item.get("month")
                amount_value = item.get("month_budget")
                if month_value is None or amount_value is None:
                    continue
                budget_map[str(month_value)] = amount_value
        elif isinstance(existing_budget, dict):
            budget_map = existing_budget
        else:
            budget_map = {}

        budget_map[str(month)] = amount
        data["budget"] = budget_map

        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
   
