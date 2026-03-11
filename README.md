# LabFlow

> Intelligent Lab Management System

LabFlow 是一个基于现代 Web 技术栈构建的实验室管理系统，旨在提供设备管理、成员管理、预约系统等功能，并具备良好的扩展性与工程化结构。

---

## 项目结构（Monorepo）

```
LabFlow/
├── frontend/        # Next.js 前端
├── backend/         # FastAPI 后端
├── nginx/           # Nginx 配置
└── README.md
```

---

## 技术栈

### Frontend

* Next.js (App Router)
* JavaScript
* TailwindCSS

### Backend

* FastAPI
* SQLAlchemy
* MySQL

### Infrastructure

* Nginx
* Docker（规划中）

---

## Git 分支规范

* `main` → 稳定可演示版本
* `dev` → 开发主线分支

功能开发分支命名规范：

* `type/<module>/<feature>`

示例：

* `feat/fe/login`
* `feat/be/auth`
* `fix/be/token-bug`

模块缩写说明：

* `fe` → frontend
* `be` → backend
* `infra` → nginx / docker
* `docs` → 文档

---

## 本地开发

### 前端启动

进入 frontend 目录：

```
npm install
npm run dev
```

默认运行在：

```
http://localhost:3000
```

---

### 后端启动

进入 backend 目录：

```
pip install -r requirements.txt
uvicorn main:app --reload
```

默认运行在：

```
http://localhost:8000
```

---

### API 文档

后端启动后访问：

```
http://localhost:8000/docs
```

使用 FastAPI 自动生成的 Swagger 文档。

---

## 项目阶段规划

### 第一阶段

* 核心 CRUD 功能
* 前后端联调
* 基础页面搭建

### 第二阶段

* 权限系统
* UI 优化
* 代码结构优化

### 第三阶段

* AI 功能接入
* 智能预约推荐
* 数据分析与可视化

---

## 协作规范

* 所有开发基于 `dev`
* 禁止直接提交到 `main`
* 提交信息遵循规范：
>  feat(fe): add login page
>
>  fix(be): fix auth validation bug
