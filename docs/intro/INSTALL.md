# LabFlow 安装指南

## 环境要求

| 依赖    | 版本要求 | 说明                    |
| ------- | -------- | ----------------------- |
| Python  | >= 3.11  | 后端运行环境            |
| Node.js | >= 18.0  | 前端运行环境            |
| MySQL   | >= 8.0   | 数据库                  |
| uv      | >= 0.5   | Python 包管理器（推荐） |
| npm     | >= 9.0   | Node.js 包管理器        |

---

## 1. 数据库初始化

### 1.1 创建数据库

```bash
mysql -u root -p < docs/DATABASE_SCHEMA.sql
```

或手动执行：

```sql
CREATE DATABASE IF NOT EXISTS labflow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE labflow;
-- 然后执行 DATABASE_SCHEMA.sql 中的建表语句
```

### 1.2 导入测试数据（可选）

```bash
mysql -u root -p labflow < docs/TEST_DATA.sql
```

**测试账号：**

| 角色       | 账号                      | 密码      |
| ---------- | ------------------------- | --------- |
| 超级管理员 | SuperAdmin@LabFlow.org    | Admin123! |
| 管理员     | 13800000001               | User123!  |
| 实验员     | 13800000002 ~ 13800000007 | User123!  |

> 注：超级管理员为虚拟用户，不存在于数据库中，通过 .env 配置认证。

---

## 2. 后端初始化

### 方式一：使用 uv（推荐）

```bash
cd backend

# 安装依赖
uv sync

# 配置环境变量
cp .env.example .env  # 编辑 .env，修改 DB_PASSWORD 和 JWT_SECRET_KEY

# 启动服务
uv run -m app.main
```

### 方式二：传统 Python 虚拟环境

```bash
cd backend

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate  # Linux/macOS
# 或 .\.venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env  # 编辑 .env

# 启动服务
python -m app.main
```

---

## 3. 前端初始化

### 安装依赖

```bash
cd frontend
npm install
```

### 配置环境变量

```bash
cp .env.local.example .env.local
# 或手动创建 .env.local
```

编辑 `.env.local`，设置 API 地址：

```env
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
# 开发环境可使用 http://localhost:8000
# 生产环境使用 https://your-domain.com
```

### 构建和运行

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm run start
```

---

## 4. Nginx 部署配置（可选）

参考 `scripts/nginx/` 目录下的配置文件：

```bash
# 开发环境
sudo cp scripts/nginx/dev.conf /etc/nginx/sites-available/labflow
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 生产环境（需配置 HTTPS）
sudo cp scripts/nginx/prod.conf /etc/nginx/sites-available/labflow
# 编辑 prod.conf 修改域名和证书路径
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. 重要配置说明

### 5.1 环境变量

后端 `.env` 关键配置：

```env
DB_PASSWORD=your-db-password      # 数据库密码（必须修改）
JWT_SECRET_KEY=your-secret-key   # JWT 密钥（生产环境必须使用强随机密钥）
AGENT_API_KEY=your-api-key       # AI API Key（智能助手功能必需）
```

生成强随机 JWT 密钥：

```bash
openssl rand -hex 64
```

### 5.2 HTTPS 要求

**生产环境必须使用 HTTPS！** 系统前后端通过 HTTP 明文传输数据（包括 JWT Token），存在安全风险。

- 开发环境：可使用自签证书 + 浏览器手动信任
- 生产环境：必须使用 Let's Encrypt 或其他可信 CA 签发的证书

### 5.3 AI 功能配置

智能助手支持 OpenAI 兼容 API（如 MiniMax、SiliconFlow、Iflow 等，大部分模型厂商均支持）：

```env
AGENT_MODEL_NAME=Qwen 3.5          # 模型名称
AGENT_API=https://api.example.com/v1  # API 地址
AGENT_API_KEY=sk-your-api-key        # API Key
```

---

## 6. 目录结构

```
LabFlow/
├── backend/                 # 后端
│   ├── app/               # 应用代码
│   ├── tests/             # 测试
│   ├── alembic/           # 数据库迁移（用于增量变更）
│   ├── .env.example       # 环境变量模板
│   ├── requirements.txt   # Python 依赖列表
│   └── .venv/             # Python 虚拟环境（uv sync 自动创建）
├── frontend/               # 前端
│   ├── app/               # Next.js App Router
│   ├── components/         # React 组件
│   └── .env.local.example # 环境变量模板
├── docs/                   # 文档
│   ├── DATABASE_SCHEMA.sql # 数据库建表脚本
│   ├── TEST_DATA.sql      # 测试数据
│   ├── README.md          # 项目说明
│   ├── intro/             # 项目简介
│   │   └── INSTALL.md     # 安装指南
│   └── api/               # API 文档
├── scripts/                # 脚本
│   └── nginx/             # Nginx 配置
└── archive/               # 归档文档
```

---

## 7. 常见问题

### Q: 数据库连接失败？

检查 `.env` 中的 `DB_PASSWORD` 是否正确，确保 MySQL 服务正在运行。

### Q: AI 功能效果不佳（如返回文本而非结构化数据、推荐结果不准确）？

模型能力对该功能影响较大，建议更换为工具调用能力更强或经过强化训练的模型，如 Qwen3.5/Qwen3.6、GPT-4o 等支持 function calling 的模型。
本项目测试使用的模型为 MiniMax-M2.7。

可选的 API 方案：

- SiliconFlow（硅基流动，知名的模型聚合平台，其中 Qwen3.5-4B 等小参数模型可免费调用，但不建议调用发布时间过早的模型，这类模型往往工具调用能力略差）
- Iflow（心流开放平台，其中 Qwen3、Kimi2 等大参数模型支持免费使用，但请注意: 该平台将于 2026 年 4 月 17 日关闭服务）
- LM Studio/Ollama（本地部署，通过图形化界面本地部署模型，需要一定硬件资源，但高度保证了信息安全）
- 其他支持 OpenAI API 格式的平台

### Q: 前端无法登录？

检查后端是否正常运行（http://localhost:8000），以及 `.env.local` 中的 `NEXT_PUBLIC_BACKEND_BASE_URL` 是否正确。

### Q: 端口被占用？

```bash
# 查看端口占用
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 或修改 .env 中的 PORT
```
