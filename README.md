# LabFlow | 智序

## 项目简介

LabFlow 智序是一款面向实验室的智能管理系统，提供实验室预约、仪器管理、审批流程等功能。

### 技术栈

| 端 | 技术 |
|----|------|
| 前端 | Next.js 16 + React 19 + TailwindCSS 4 |
| 后端 | FastAPI + SQLAlchemy 2.0 (async) + MySQL 8 |
| AI | Pydantic_ai (智能预约助手、AI数据总结)  |

> [!Note]
> 
> 附: Pydantic_ai 简要说明文档: [docs/AI_ASSISTANT_INTEGRATION.md](docs/AI_ASSISTANT_INTEGRATION.md)
---

## 功能特性

### 核心功能

- **实验室管理** - 实验室的增删改查、负责人分配
- **仪器管理** - 仪器的增删改查（含软删除）
- **预约系统** - 用户提交预约申请
- **审批流程** - 单级审批（实验室负责人审批）
- **通知系统** - 站内通知、审批状态变更提醒
- **智能助手** - AI 驱动的预约推荐（基于自然语言）

### 用户角色

| 角色 | 说明 |
|------|------|
| 超级管理员 | 系统最高权限，可设置管理员(主要用于初次数据导入) |
| 管理员 | 管理实验室、仪器、用户 |
| 实验员 | 查看并预约实验室、使用仪器 |

---

## 项目结构

```
LabFlow/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── api/        # API 路由
│   │   ├── core/       # 核心配置
│   │   ├── crud/       # 数据库操作
│   │   ├── models/     # SQLAlchemy 模型
│   │   ├── schemas/    # Pydantic 数据模型
│   │   └── services/   # 业务逻辑
│   ├── alembic/         # 数据库迁移
│   └── tests/           # 测试
│
├── frontend/            # Next.js 前端
│   ├── app/            # 页面
│   ├── components/     # 组件
│   └── lib/            # 工具函数
│
├── docs/               # 文档
│   └── api/            # API 接口文档
│
└── scripts/           # 脚本
    └── nginx/          # Nginx 配置
```

---

## 快速开始

### 前置要求

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- uv (Python 包管理器)

### 后端启动

```bash
cd backend

# 安装依赖
uv sync

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库和 AI 配置

# 数据库迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --reload
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动服务
npm run dev
```

### 访问地址

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

## 桌面封装（Windows）

### 后端单文件封装（uv + PyInstaller）

```powershell
cd backend
.\build_backend_onefile.ps1
```

产物：`backend\dist\LabFlowBackend.exe`  
运行方式：将 `LabFlowBackend.exe` 与 `.env` 放在同一目录后直接运行。

### 前端单文件封装（Electron Portable）

```powershell
cd frontend
npm install
npm run electron:dist
```

产物：
- `frontend\dist-electron\LabFlowFrontend 0.1.0.exe`
- `frontend\dist-electron\frontend.config.json`
- `frontend\dist-electron\portable-release\`（仅含 exe + 配置文件）

`frontend.config.json` 示例：

```json
{
  "backendBaseUrl": "http://127.0.0.1:8000",
  "frontendPort": 3210
}
```

说明：
- Electron 封装使用 `frontend.config.json` 做运行时配置，不依赖与后端同目录部署。
- `.env.local` 属于前端构建时变量；分发后推荐改 `frontend.config.json`，无需重打包。
- `LabFlowFrontend 0.1.0.exe` 与 `frontend.config.json` 需放在同一目录。
- `LabFlowBackend.exe` 与 `.env` 需放在同一目录。

### Cookie / 登录态持久化

前端 Electron 默认会持久化 Cookie 和本地存储到系统用户目录（`app.getPath('userData')`），因此**程序退出后登录态通常会保留**。如需清空，可在系统中删除该应用用户数据目录。

完整可复现封装流程见：`docs/BINARY_PACKAGING_REPRODUCIBLE.md`

---

## 测试账号

| 类型 | 账号 | 密码 | 角色 |
|------|------|------|------|
| 超级管理员 | SuperAdmin@LabFlow.org | Admin123! | 超级管理员 |
| 管理员 | 13800000000 | User123! | 管理员 |
| 实验员 | 13800000001 | User123! | 实验员 |

---

## API 接口

详见 [docs/api/](docs/api/)

---

## 数据库

### 数据库建表

文件 [docs/DATABASE_SCHEMA.sql](docs/DATABASE_SCHEMA.sql)

### 测试数据

文件 [docs/TEST_DATA.sql](docs/TEST_DATA.sql)

### 状态值说明

| 表 | 字段 | 值 |
|----|------|-----|
| lab/instrument | status | 0=正常, 1=维修, 2=停用, 3=删除 |
| user | is_active | 0=正常, 1=封禁, 2=注销 |
| reservation | status | 0=审批中, 1=通过, 2=拒绝, 3=取消, 4=草稿 |
| approval | status | 0=通过, 1=拒绝 |

---

## 部署

### Nginx + SSL

生产环境建议使用 Nginx 反向代理并配置 HTTPS：

```bash
# 复制 Nginx 配置
sudo cp scripts/nginx/prod.conf /etc/nginx/sites-available/labflow
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/

# 修改配置中的 SSL 证书路径
sudo nano /etc/nginx/sites-available/labflow

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

---

## 开发指南

### 代码规范

- Python: ruff + pyright
- JavaScript: ESLint

```bash
# Backend
cd backend
ruff check .           # 检查
ruff format .          # 格式化
pyright                # 类型检查

# Frontend
cd frontend
npm run lint           # 检查
```

## License

MIT
