# LabFlow API Documentation

## Overview

LabFlow 实验室管理系统后端 API 文档，基于 OpenAPI 3.0 标准。

## API Documentation

完整 API 文档请查看：[`openapi.yaml`](./openapi.yaml)

该文件包含所有 API 端点的详细定义，包括：
- Auth API - 认证接口
- User API - 用户管理
- User API - 用户管理
- Lab API - 实验室管理
- Instrument API - 仪器管理
- Reservation API - 预约管理
- Approval API - 审批管理

---

## Base Information

- **Base URL**: `http://localhost:8000`
- **认证方式**: JWT Token (Bearer Token)
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
| Authorization | Yes (after login) | Bearer Token |

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

### Approval Status (审批状态)
| 值 | 说明 |
|----|------|
| 0 | 通过 |
| 1 | 拒绝 |

---

*最后更新: 2026-04-04*
