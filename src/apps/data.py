from pydantic import BaseModel

class dataItem(BaseModel):
    """
    基础数据项
    
    :param date: 日期
    :param event: 事件
    :param amount: 金额
    :param type: 类型（支出/收入）
    :param remark: 备注
    :param category: 分类
    """
    date : str
    event: str
    amount : float
    type : str
    remark : str
    category : str


class dataBudget(BaseModel):
    """
    预算数据项
    
    :param year: 年份
    :param month: 月份
    :param monthlyLimit: 月预算金额
    :param enabled: 是否启用
    """
    year: int
    month: int
    monthlyLimit: float
    enabled: bool = True
