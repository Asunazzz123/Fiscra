import csv
import os
from typing import List, Dict, Any
from pathlib import Path
from .lock import FileLock

class Storage:
    """
    负责CSV的 读 / 写 / 删除 / 覆盖
    """
    def __init__(self, filename="data.csv"):
        base_dir = Path(__file__).resolve().parent.parent.parent  
        self.path = base_dir / "storage" / filename
        self.path.parent.mkdir(parents=True, exist_ok=True)
        # 初始化文件锁实例
        lockfile_path = str(self.path) + '.lock'
        self._file_lock = FileLock(lockfile_path, timeout=5.0)
        self.ensure_csv()
        


    def ensure_csv(self):
        """确保 CSV 文件存在，如果不存在则创建"""
        if not os.path.exists(self.path):
            with open(self.path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["id", "date", "event", "amount", "type", "remark", "category"])

    def read_all(self) -> List[List[str]]:
        """读取所有行（包括header）"""
        with self._file_lock.acquire():
            with open(self.path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                return list(reader)

    def append_row(self, row: List[Any]):
        """追加一行"""
        with self._file_lock.acquire():
            with open(self.path, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(row)

    def write_all(self, rows: List[List[Any]]):
        """覆盖写入"""
        with self._file_lock.acquire():
            with open(self.path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerows(rows)

    def delete_by_id(self, id_value: str):
        """删除匹配 id 的行"""
        with self._file_lock.acquire():
            # 在锁内直接读取，避免嵌套锁
            with open(self.path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
            
            header, data = rows[0], rows[1:]
            new_rows = [header] + [row for row in data if row[0] != id_value]
            
            # 在同一锁内写回
            with open(self.path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerows(new_rows)
    def fetch_id(self):
        """获取当前最大的 ID 值"""
        with self._file_lock.acquire():
            # 在锁内直接读取，确保并发安全
            with open(self.path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                rows = list(reader)
            if len(rows) <= 1:
                return 0

            max_id = 0
            for row in rows[1:]:
                if not row:
                    continue
                raw = row[0]
                try:
                    val = int(raw)
                    if val > max_id:
                        max_id = val
                except Exception:
                    # 忽略无法解析为整数的 id（如空字符串或 UUID）
                    continue

            return max_id
    


    

    