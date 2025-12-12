"""
项目路径配置
集中管理所有路径，避免在各模块中硬编码相对路径
"""
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

# 存储目录
STORAGE_DIR = PROJECT_ROOT / "storage"

# 确保存储目录存在
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
