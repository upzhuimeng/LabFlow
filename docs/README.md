## LabFlow | 智序

智能实验室管理系统

---

## 这是什么？

一个用于管理实验室预约和仪器的系统。

**能做什么？**
- 实验员：查看实验室、预约使用、查看仪器
- 管理员：管理实验室和仪器、管理用户权限
- 审批人：审批预约申请

---

## 设计文档

- [项目概述](./intro/introduction.md) - 设计目的、关键技术、作品特色
- [二进制封装复现指南（Windows）](./BINARY_PACKAGING_REPRODUCIBLE.md) - 从依赖初始化到封装产物分发的完整流程

---

## 核心概念

### 实验室 (Lab)
- 包含名称、地址、容纳人数等基本信息
- 拥有若干仪器
- 由实验室负责人管理

### 仪器 (Instrument)
- 归属于某个实验室
- 记录型号、厂商、采购日期、价格等信息

### 用户 (User)
| 角色 | 能做什么 |
|------|----------|
| 超级管理员 | 最高权限，可设置管理员 |
| 管理员 | 管理实验室、仪器、负责人 |
| 实验员 | 使用实验室和仪器 |

### 审批人
实验室负责人负责审批预约申请。

---

## 预约流程

当实验员提交预约申请后：

```
实验员提交预约
       ↓
实验室负责人审核
       ↓ (通过)
预约成功
```

**两种结局**
- 拒绝 → 预约被拒
- 通过 → 预约成功

---

## 数据规范

- 删除操作均为**软删除**（数据仍保留，只标记为删除）
- 所有操作都有**日志记录**，可追溯

---

## 数据库

- 建表 SQL：[`DATABASE_SCHEMA.sql`](./DATABASE_SCHEMA.sql)（基于 Alembic 迁移生成）
- 测试数据：[`TEST_DATA.sql`](./TEST_DATA.sql)

### 数据库表（12 张）
`alembic_version`, `user`, `lab`, `instrument`, `lab_user`, `lab_user_log`, `reservation`, `user_log`, `approval`, `instrument_log`, `notification`, `agent_log`

### 测试账号
> 注：超级管理员为虚拟用户（不在数据库中），使用 `.env` 中的凭证登录

| 角色 | 账号 | 密码 |
|------|------|------|
| 超级管理员 | SuperAdmin@LabFlow.org | Admin123! |
| 管理员 | 13800000001 | User123! |
| 实验员 | 13800000002 ~ 13800000007 | User123! |

---

## 部署

### Nginx 配置

参考 [`scripts/nginx/`](https://github.com/zhuimeng-hstc/LabFlow/tree/main/scripts/nginx) 目录下的配置文件：

- `dev.conf` - 开发环境配置
- `prod.conf` - 生产环境配置

### 安全要求

**必须使用 HTTPS 访问**

系统前后端通过 HTTP 明文传输数据（Cookie 中的 JWT Token 等敏感信息），**必须通过 HTTPS 加密传输**，否则存在安全风险。

#### HTTP 强制重定向到 HTTPS

在 Nginx 配置中取消注释 HTTP server 块以启用强制跳转：

```nginx
server {
    listen 80;
    server_name labflow.example.com;
    return 301 https://$server_name$request_uri;
}
```

#### SSL 证书

生产环境建议使用 Let's Encrypt 或其他可信机构颁发的证书：

```bash
# 使用 certbot 自动申请和续期
sudo certbot --nginx -d labflow.example.com
```
