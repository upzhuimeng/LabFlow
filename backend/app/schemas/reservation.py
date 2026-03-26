from pydantic import BaseModel, Field, model_validator
from datetime import datetime


# 创建预约
class ReservationCreate(BaseModel):
    lab_id: int = Field(..., description="实验室ID")
    start_time: datetime = Field(..., description="开始时间")
    end_time: datetime = Field(..., description="结束时间")
    purpose: str = Field(default=None, description="使用目的")

    @model_validator(mode="after")
    def check_time(self):
        if self.start_time >= self.end_time:
            raise ValueError("结束时间必须大于开始时间")
        return self


# 更新（用于取消）
class ReservationUpdate(BaseModel):
    status: int = Field(..., description="状态（3-取消）")


# 返回模型
class ReservationOut(BaseModel):
    id: int = Field(..., description="ID")
    user_id: int = Field(..., description="用户ID")
    lab_id: int = Field(..., description="实验室ID")
    start_time: datetime = Field(..., description="开始时间")
    end_time: datetime = Field(..., description="结束时间")
    purpose: str = Field(default=None, description="使用目的")
    status: int = Field(..., description="状态")
    current_level: int = Field(..., description="审批阶段")
    is_deleted: int = Field(..., description="删除标记")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(default=None, description="更新时间")