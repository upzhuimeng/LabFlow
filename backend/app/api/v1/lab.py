from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import Session_Local
from app.services.lab import *
from app.schemas.lab import *
from app.api.deps import  get_current_user
from app.models.user import User


async def get_db():
    async with Session_Local() as session:
        yield session

def require_role(max_role: int):
    async def checker(user: User = Depends(get_current_user)):
        if user.role > max_role:
            raise BusinessError("权限不足")
        return user
    return checker

router = APIRouter(prefix="/labs", tags=["实验室"])


# 查询列表（实验员）
@router.get("/")
async def get_labs(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(2))
):
    data = await get_labs_service(db)
    return {"code": 200, "message": "OK", "data": data}


# 查询详情
@router.get("/{lab_id}")
async def get_lab(
    lab_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(2))
):
    result = await get_lab_service(db, lab_id)
    return {"code": 200, "message": "OK", "data": result}


# 创建（管理员）
@router.post("/")
async def create_lab(
    data: LabCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await create_lab_service(db, data)
    return {"code": 201, "message": "Created", "data": result}


# 更新（管理员）
@router.put("/{lab_id}")
async def update_lab(
    lab_id: int,
    data: LabUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await update_lab_service(db, lab_id, data)
    return {"code": 200, "message": "OK", "data": result}


# 修改状态（管理员）
@router.patch("/{lab_id}")
async def update_lab_status(
    lab_id: int,
    data: LabStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await update_lab_status_service(db, lab_id, data.status)
    return {"code": 200, "message": "OK", "data": result}


# 使用申请（实验员）
@router.post("/{lab_id}/apply")
async def apply_lab(
    lab_id: int,
    data: LabApply,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await apply_lab_service(db, lab_id, data, user.id)
    return {"code": 201, "message": "Created", "data": result}