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

