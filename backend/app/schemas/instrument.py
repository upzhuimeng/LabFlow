from pydantic import BaseModel, Field, model_validator
from datetime import datetime


# 创建仪器
class InstrumentCreate(BaseModel):
    name: str = Field(..., description="仪器名称")
    model: str = Field(..., description="型号")
    manufacturer: str = Field(..., description="厂商")
    supplier: str = Field(..., description="供应商")
    purchase_date: datetime = Field(default=None,description="采购时间",)
    price: float = Field(..., description="价格")
    lab_id: int = Field(..., description="实验室ID")
    remark: str = Field(default=None, description="备注")


# 更新仪器
class InstrumentUpdate(BaseModel):
    name: str = Field(default=None, description="仪器名称")
    model: str = Field(default=None, description="型号")
    manufacturer: str = Field(default=None, description="厂商")
    supplier: str = Field(default=None, description="供应商")
    purchase_date: datetime = Field(default=None, description="采购时间")
    price: float = Field(default=None, description="价格")
    lab_id: int = Field(default=None, description="实验室ID")
    remark: str = Field(default=None, description="备注")
    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if not any(self.__dict__.values()):
            raise ValueError("至少需要提供一个更新字段")
        return self


# 状态修改
class InstrumentStatusUpdate(BaseModel):
    status: int = Field(...,description="状态（0正常 1维修 2停用）")
    @model_validator(mode="after")
    def check_status(self):
        if self.status not in [0, 1, 2]:
            raise ValueError("状态必须是 0/1/2")
        return self


# 返回模型
class InstrumentOut(BaseModel):
    id: int = Field(..., description="ID")
    name: str = Field(..., description="名称")
    model: str = Field(..., description="型号")
    manufacturer: str = Field(..., description="厂商")
    supplier: str = Field(..., description="供应商")
    purchase_date: datetime = Field(default=None, description="采购时间")
    price: float = Field(..., description="价格")
    status: int = Field(default=0, description="状态")
    lab_id: int = Field(..., description="实验室ID")
    remark: str = Field(default=None, description="备注")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(default=None, description="更新时间")
