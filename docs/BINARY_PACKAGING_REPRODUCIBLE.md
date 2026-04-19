# LabFlow 二进制封装复现指南（Windows）

本文档用于**从零开始**在新机器上复现 LabFlow 的二进制封装流程，最终产出：

- 后端：`LabFlowBackend.exe` + `.env`
- 前端：`LabFlowFrontend 0.1.0.exe` + `frontend.config.json`

---

## 1. 环境准备

建议使用以下版本（与当前项目脚本一致）：

- Windows 10/11 x64
- Git
- Python 3.11+
- [uv](https://docs.astral.sh/uv/)
- Node.js 18+（建议 20 LTS）
- npm（随 Node.js）

在项目根目录执行：

```powershell
git clone <your-repo-url> LabFlow
cd LabFlow
```

---

## 2. 后端封装（uv + PyInstaller 单文件）

进入后端目录并初始化依赖：

```powershell
cd backend
uv sync
```

准备配置文件（封装后会复制到 `dist`）：

```powershell
Copy-Item .env.example .env
```

按需编辑 `.env`（数据库、JWT、AI Key 等），然后执行封装：

```powershell
.\build_backend_onefile.ps1
```

产物目录：

- `backend\dist\LabFlowBackend.exe`
- `backend\dist\.env`
- `backend\dist\.env.example`

> 说明：运行时将 `LabFlowBackend.exe` 与 `.env` 放在同一目录即可。

---

## 3. 前端封装（Electron Portable 单文件）

进入前端目录并安装依赖：

```powershell
cd ..\frontend
npm install
```

可选：若网络下载 Electron 缓慢，可先设置镜像：

```powershell
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
$env:ELECTRON_BUILDER_BINARIES_MIRROR='https://npmmirror.com/mirrors/electron-builder-binaries/'
```

执行封装：

```powershell
npm run electron:dist
```

产物目录：

- `frontend\dist-electron\LabFlowFrontend 0.1.0.exe`
- `frontend\dist-electron\frontend.config.json`
- `frontend\dist-electron\portable-release\`（仅含 exe + 配置文件）

---

## 4. 分发目录建议（比赛提交）

建议在项目根目录准备一个分发目录（示例）：

```powershell
cd ..
New-Item -ItemType Directory -Path .\release -Force | Out-Null

Copy-Item .\backend\dist\LabFlowBackend.exe .\release\
Copy-Item .\backend\dist\.env .\release\
Copy-Item .\frontend\dist-electron\portable-release\LabFlowFrontend* .\release\
Copy-Item .\frontend\dist-electron\portable-release\frontend.config.json .\release\
```

最终建议提交给比赛方的“作品”目录可包含：

- `LabFlowBackend.exe`
- `.env`
- `LabFlowFrontend 0.1.0.exe`
- `frontend.config.json`

---

## 5. 配置与行为说明

### 5.1 后端配置加载

后端使用 `python-dotenv` 的 `load_dotenv()` 读取 `.env`。  
封装版与 WebUI 开发版均沿用该方式，配置行为一致。

后端封装版的配置文件位置要求：

- `LabFlowBackend.exe` 与 `.env` 必须放在**同一目录**
- 若放在不同目录，后端将无法按预期读取配置并可能启动失败

### 5.2 前端配置加载

- WebUI 模式：使用 `.env.local`（构建时注入）
- Electron 封装模式：优先读取 `frontend.config.json`（运行时读取，可改后直接生效）

前端封装版的配置文件位置要求：

- `LabFlowFrontend 0.1.0.exe` 与 `frontend.config.json` 必须放在**同一目录**
- 若将配置文件放到其他目录，前端会回退到默认地址，常见表现为“后端服务连接失败”

`frontend.config.json` 字段要求：

```json
{
  "backendBaseUrl": "http://127.0.0.1:8000",
  "frontendPort": 3210
}
```

- `backendBaseUrl`：后端服务基地址（必须包含协议与端口）
- `frontendPort`：前端内置服务端口（建议保留默认 3210，避免端口冲突时再修改）
- 文件编码建议 UTF-8（带或不带 BOM 均可）

因此分发多个前端副本时，推荐每个副本单独维护自己的 `frontend.config.json`，且与对应 exe 同目录放置。

### 5.3 Cookie / 登录态

Electron 默认会将 Cookie 与本地存储持久化到用户目录（`app.getPath('userData')`），  
程序退出后登录态通常会保留。清理该目录可重置本地登录状态。

---

## 6. 快速验收

在分发目录中启动：

1. `LabFlowBackend.exe`
2. `LabFlowFrontend 0.1.0.exe`

并检查：

- 后端健康检查：`http://127.0.0.1:8000/health`
- 前端登录页：`http://127.0.0.1:3210/user/login`（Electron 内部加载）

---

## 7. 常见问题

### Q1: 报错 `Missing Next standalone server`

请确认使用的是本仓库当前版本脚本，并重新执行：

```powershell
cd frontend
npm run electron:dist
```

### Q2: 前端打包下载 Electron 超时

先设置镜像环境变量（见第 3 节），再执行打包命令。

### Q3: WebUI 部署是否被封装改动影响

不会。WebUI 仍按原有方式运行：

- 后端读取 `.env`
- 前端读取 `.env.local`

