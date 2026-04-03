# LabFlow Nginx 配置

## 文件说明

- `nginx/dev.conf` - 开发环境配置
- `nginx/prod.conf` - 生产环境配置

---

## 开发环境使用

```bash
# 复制配置
sudo cp dev.conf /etc/nginx/sites-available/labflow
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

## 生产环境使用

```bash
# 复制配置
sudo cp prod.conf /etc/nginx/sites-available/labflow
sudo ln -s /etc/nginx/sites-available/labflow /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

---

## 注意事项

1. 确保已安装 Nginx
2. 根据实际情况修改 `server_name`
3. 如果使用 Unix socket，确保目录存在并有权限
4. HTTPS 配置需要在生产环境中使用 Let's Encrypt 或其他证书
