from pydantic import BaseModel, Field, model_validator
from datetime import datetime


#创建实验室
class LabCreate(BaseModel):
    name: str = Field(..., description="实验室名称")
    address: str = Field(..., description="地址")
    capacity: int = Field(default=None, description="容纳人数")
    tag_id: int = Field(..., description="标签ID")
    keyword: str = Field(default=None, description="关键词")
    description: str = Field(default=None, description="实验室说明")


#更新实验室
class LabUpdate(BaseModel):
    name: str = Field(default=None, description="实验室名称")
    address: str = Field(default=None, description="地址")
    capacity: int = Field(default=None, description="容纳人数")
    tag_id: int = Field(default=None, description="标签ID")
    keyword: str = Field(default=None, description="关键词")
    description: str = Field(default=None, description="实验室说明")

    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if not any(self.__dict__.values()):
            raise ValueError("至少需要提供一个更新字段")
        return self


#状态修改
class LabStatusUpdate(BaseModel):
    status: int = Field(..., description="状态（0正常 1维护 2停用）")

    @model_validator(mode="after")
    def check_status(self):
        if self.status not in [0, 1, 2]:
            raise ValueError("状态必须是 0/1/2")
        return self


#实验室使用申请
class LabApply(BaseModel):
    start_time: datetime = Field(..., description="开始时间")
    end_time: datetime = Field(..., description="结束时间")
    reason: str = Field(..., description="申请理由")


#返回模型
class LabOut(BaseModel):
    id: int = Field(..., description="ID")
    name: str = Field(..., description="名称")
    address: str = Field(..., description="地址")
    capacity: int = Field(default=None, description="容纳人数")
    status: int = Field(default=0, description="状态")
    tag_id: int = Field(..., description="标签ID")
    keyword: str = Field(default=None, description="关键词")
    description: str = Field(default=None, description="说明")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(default=None, description="更新时间")