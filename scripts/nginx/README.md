# LabFlow Nginx 配置

## 文件说明

- `dev.conf` - 开发环境配置（HTTP）
- `prod.conf` - 生产环境配置（HTTPS + HTTP 重定向）

## 前提条件

1. 确保已安装 Nginx
2. 生产环境需要准备好 SSL 证书

## 开发环境使用

```bash
# 复制配置
sudo cp dev.conf /etc/nginx/sites-available/labflow-dev
sudo ln -s /etc/nginx/sites-available/labflow-dev /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

## 生产环境使用

```bash
# 1. 修改 prod.conf 中的 server_name 为你的域名
# 2. 修改 SSL 证书路径
sudo cp prod.conf /etc/nginx/sites-available/labflow
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

## 安全说明

- 生产环境 **必须使用 HTTPS**，系统前后端通过 HTTP 明文传输数据
- `prod.conf` 已配置 HTTP（80端口）强制重定向到 HTTPS（443端口）
- 使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书（会自动修改 nginx 配置）
sudo certbot --nginx -d labflow.example.com
```

## 路径说明

| 路径 | 目标服务 |
|------|----------|
| `/` | Next.js 前端 |
| `/api/*` | FastAPI 后端 |
| `/docs` | Swagger API 文档 |
