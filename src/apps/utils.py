import platform
from datetime import datetime

def system_():
    return platform.system()

def current_month():
    year = datetime.now().year
    month = datetime.now().month
    return year, month