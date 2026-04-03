# LabFlow API Documentation

## Overview

LabFlow 实验室管理系统后端 API 文档，基于 OpenAPI 3.0 标准。

## Base Information

- **Base URL**: `http://localhost:8000`
- **认证方式**: JWT Token (HttpOnly Cookie)
- **请求格式**: JSON
- **响应格式**: 
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## Status Code

| Code | Description |
|------|-------------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| Content-Type | Yes | application/json |
| Cookie | Yes (after login) | JWT Token (HttpOnly) |

## Table of Contents

1. [Auth API](./auth.yaml) - 认证接口 (登录/注册/登出)
2. [User API](./user.yaml) - 用户管理
3. [Lab API](./lab.yaml) - 实验室管理
4. [Instrument API](./instrument.yaml) - 仪器管理
5. [Reservation API](./reservation.yaml) - 预约管理
6. [Tag API](./tag.yaml) - 标签管理
7. [Approval API](./approval.yaml) - 审批管理

---

## 状态值说明

### User Role (用户角色)
| 值 | 说明 |
|----|------|
| 0 | 超级管理员 |
| 1 | 管理员 |
| 2 | 实验员 |

### User is_active (用户状态)
| 值 | 说明 |
|----|------|
| 0 | 正常 |
| 1 | 封禁 |
| 2 | 注销 |

### Lab/Instrument Status (实验室/仪器状态)
| 值 | 说明 |
|----|------|
| 0 | 正常 |
| 1 | 维修/维护 |
| 2 | 停用 |

### Reservation Status (预约状态)
| 值 | 说明 |
|----|------|
| 0 | 审批中 |
| 1 | 通过 |
| 2 | 拒绝 |
| 3 | 已取消 |

### Reservation Current Level (预约审批阶段)
| 值 | 说明 |
|----|------|
| 0 | 未申请 |
| 1 | 一级审批中 |
| 2 | 二级审批中 |
| 3 | 全部通过 |

### Approval Status (审批状态)
| 值 | 说明 |
|----|------|
| 0 | 通过 |
| 1 | 拒绝 |

---

*最后更新: 2026-03-30*
