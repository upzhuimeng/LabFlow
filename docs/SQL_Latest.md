## 🔬 instrument（仪器表）

| 字段名        | 类型          | 约束                | 外键        | 备注                         |
| ------------- | ------------- | ------------------- | ----------- | ---------------------------- |
| id            | INT           | PK, AUTO_INCREMENT  |             | 仪器ID                       |
| name          | VARCHAR(100)  | NOT NULL            |             | 仪器名称                     |
| model         | VARCHAR(100)  | NOT NULL            |             | 型号                         |
| manufacturer  | VARCHAR(255)  |                     |             | 厂商                         |
| supplier      | VARCHAR(255)  |                     |             | 供应商                       |
| purchase_date | DATETIME      |                     |             | 采购日期                     |
| price         | DECIMAL(10,2) |                     |             | 价格                         |
| status        | SMALLINT      | NOT NULL, DEFAULT 0 |             | 状态（0-正常 1-维修 2-停用） |
| lab_id        | INT           | NOT NULL            | FK → lab.id | 所属实验室                   |
| remark        | VARCHAR(255)  |                     |             | 备注                         |
| created_at    | DATETIME      | NOT NULL            |             | 创建时间                     |
| updated_at    | DATETIME      |                     |             | 更新时间                     |

👉 索引建议：

- INDEX(lab_id)

---

## 🏢 lab（实验室表）

| 字段名      | 类型         | 约束                | 外键        | 备注                        |
| ----------- | ------------ | ------------------- | ----------- | --------------------------- |
| id          | INT          | PK, AUTO_INCREMENT  |             | 实验室ID                    |
| name        | VARCHAR(100) | NOT NULL            |             | 名称                        |
| address     | VARCHAR(255) | NOT NULL            |             | 地址                        |
| capacity    | INT          |                     |             | 容纳人数（NULL-未设置）     |
| status      | SMALLINT     | NOT NULL, DEFAULT 0 |             | 状态 (0-正常 1-维护 2-停用) |
| tag_id      | INT          | NOT NULL            | FK → tag.id | 标签                        |
| keyword     | VARCHAR(255) |                     |             | 关键字，用于大模型检索      |
| description | TEXT         |                     |             | 实验室说明                  |
| created_at  | DATETIME     | NOT NULL            |             | 创建时间                    |
| updated_at  | DATETIME     |                     |             | 更新时间                    |

👉 索引建议：

- INDEX(tag_id)

---

## 👤 user（用户表）

| 字段名        | 类型         | 约束               | 外键 | 备注                                        |
| ------------- | ------------ | ------------------ | ---- | ------------------------------------------- |
| id            | INT          | PK, AUTO_INCREMENT |      | 用户ID                                      |
| name          | VARCHAR(50)  | NOT NULL           |      | 用户名                                      |
| password_hash | VARCHAR(255) | NOT NULL           |      | 密码哈希                                    |
| role          | SMALLINT     | DEFAULT 2          |      | 角色（0-超级管理员 1-管理员 2-实验员）      |
| phone         | VARCHAR(20)  | UNIQUE             |      | 手机号(默认11位，为国际代码预留20字符长度） |
| email         | VARCHAR(255) | UNIQUE             |      | 邮箱                                        |
| avatar_url    | VARCHAR(255) |                    |      | 头像                                        |
| is_active     | SMALLINT     | DEFAULT 0          |      | 是否启用 (0-正常 1-封禁 2-注销)             |
| last_login_at | DATETIME     |                    |      | 最后登录                                    |
| created_at    | DATETIME     | NOT NULL           |      | 创建时间                                    |
| updated_at    | DATETIME     |                    |      | 更新时间                                    |

---

## 🏷️ tag（标签表）

| 字段名      | 类型         | 约束               | 外键 | 备注     |
| ----------- | ------------ | ------------------ | ---- | -------- |
| id          | INT          | PK, AUTO_INCREMENT |      | 标签ID   |
| name        | VARCHAR(50)  | UNIQUE, NOT NULL   |      | 标签名   |
| description | VARCHAR(255) |                    |      | 描述     |
| created_at  | DATETIME     | NOT NULL           |      | 创建时间 |

---

## 🔗 lab_user（实验室负责人）

| 字段名     | 类型     | 约束                | 外键         | 备注                     |
| ---------- | -------- | ------------------- | ------------ | ------------------------ |
| id         | INT      | PK, AUTO_INCREMENT  |              | ID                       |
| lab_id     | INT      | NOT NULL            | FK → lab.id  | 实验室                   |
| user_id    | INT      | NOT NULL            | FK → user.id | 用户                     |
| created_at | DATETIME | NOT NULL            |              | 创建时间                 |
| is_active  | SMALLINT | NOT NULL, DEFAULT 0 |              | 是否有效 (0-正常 1-无效) |

👉 约束：

- UNIQUE(lab_id, user_id)

---

## 🔗 tag_user（标签负责人）

| 字段名     | 类型     | 约束               | 外键         | 备注     |
| ---------- | -------- | ------------------ | ------------ | -------- |
| id         | INT      | PK, AUTO_INCREMENT |              | ID       |
| tag_id     | INT      | NOT NULL           | FK → tag.id  | 标签     |
| user_id    | INT      | NOT NULL           | FK → user.id | 用户     |
| created_at | DATETIME | NOT NULL           |              | 创建时间 |

👉 约束：

- UNIQUE(tag_id, user_id)

---

## 📅 reservation（预约表）

| 字段名        | 类型     | 约束               | 外键         | 备注                                                                    |
| ------------- | -------- | ------------------ | ------------ | ----------------------------------------------------------------------- |
| id            | INT      | PK, AUTO_INCREMENT |              | 预约ID                                                                  |
| user_id       | INT      | NOT NULL           | FK → user.id | 申请人                                                                  |
| lab_id        | INT      | NOT NULL           | FK → lab.id  | 实验室                                                                  |
| start_time    | DATETIME | NOT NULL           |              | 开始时间                                                                |
| end_time      | DATETIME | NOT NULL           |              | 结束时间                                                                |
| purpose       | TEXT     |                    |              | 使用目的                                                                |
| status        | SMALLINT | DEFAULT 0          |              | 状态（0审批中 1通过 2拒绝 3已取消）                                      |
| current_level | SMALLINT | DEFAULT 1          |              | 当前审批阶段 (数字表示所到级别，0表示创建但未申请，3表示所有级别都通过) |
| is_deleted    | SMALLINT | DEFAULT 0          |              | 软删除标记（0-正常 1-已删除）                                           |
| created_at    | DATETIME | NOT NULL           |              | 创建时间                                                                |
| updated_at    | DATETIME |                    |              | 更新时间                                                                |

👉 索引建议：

- INDEX(user_id)
- INDEX(lab_id)

---

## ✅ approval（审批表）

| 字段名         | 类型     | 约束               | 外键                | 备注                                                                           |
| -------------- | -------- | ------------------ | ------------------- | ------------------------------------------------------------------------------ |
| id             | INT      | PK, AUTO_INCREMENT |                     | 审批ID                                                                         |
| reservation_id | INT      | NOT NULL           | FK → reservation.id | 预约                                                                           |
| approver_id    | INT      | NOT NULL           | FK → user.id        | 审批人                                                                         |
| level          | SMALLINT | NOT NULL           |                     | 审批级别（1/2）                                                                |
| status         | SMALLINT | DEFAULT 0          |                     | 状态 (0-通过 1-拒绝，由于审批人和申请是多对多关系，所有这里只记录处理过的审批) |
| comment        | TEXT     |                    |                     | 审批意见                                                                       |
| approved_at    | DATETIME |                    |                     | 审批时间                                                                       |
| created_at     | DATETIME | NOT NULL           |                     | 创建时间                                                                       |

👉 索引建议：

- INDEX(reservation_id)
- INDEX(approver_id)

---

# 📒 日志系统

> 日志表记录规则：
>
> - **Create**：`*_id`=新ID，所有字段记录创建时的值
> - **Update**：`*_id`不变，只记录**变更字段**，其他为 NULL
> - **Delete**：原表软删除，`*_id` 作为数字记录保留

---

## 📝 instrument_log（仪器日志）

| 字段名        | 类型          | 约束               | 外键               | 备注                         |
| ------------- | ------------- | ------------------ | ------------------ | ---------------------------- |
| id            | INT           | PK, AUTO_INCREMENT |                    | 日志ID                       |
| instrument_id | INT           | NOT NULL           | FK → instrument.id | 被操作的仪器ID               |
| operator_id   | INT           |                    | FK → user.id       | 操作人（可NULL）             |
| action        | VARCHAR(20)   | NOT NULL           |                    | create/update/delete         |
| name          | VARCHAR(100)  |                    |                    | 仪器名称                     |
| model         | VARCHAR(100)  |                    |                    | 型号                         |
| manufacturer  | VARCHAR(255)  |                    |                    | 厂商                         |
| supplier      | VARCHAR(255)  |                    |                    | 供应商                       |
| purchase_date | DATETIME      |                    |                    | 采购日期                     |
| price         | DECIMAL(10,2) |                    |                    | 价格                         |
| status        | SMALLINT      |                    |                    | 状态（0-正常 1-维修 2-停用） |
| lab_id        | INT           |                    | FK → lab.id        | 所属实验室                   |
| remark        | VARCHAR(255)  |                    |                    | 备注                         |
| created_at    | DATETIME      | NOT NULL           |                    | 操作时间                     |

👉 索引建议：

- INDEX(instrument_id)
- INDEX(operator_id)
- INDEX(created_at)

---

## 📝 lab_log（实验室日志）

| 字段名      | 类型         | 约束               | 外键         | 备注                        |
| ----------- | ------------ | ------------------ | ------------ | --------------------------- |
| id          | INT          | PK, AUTO_INCREMENT |              | 日志ID                      |
| lab_id      | INT          | NOT NULL           | FK → lab.id  | 被操作的实验室ID            |
| operator_id | INT          |                    | FK → user.id | 操作人（可NULL）            |
| action      | VARCHAR(20)  | NOT NULL           |              | create/update/delete        |
| name        | VARCHAR(100) |                    |              | 名称                        |
| address     | VARCHAR(255) |                    |              | 地址                        |
| capacity    | INT          |                    |              | 容纳人数                    |
| status      | SMALLINT     |                    |              | 状态 (0-正常 1-维护 2-停用) |
| tag_id      | INT          |                    | FK → tag.id  | 标签                        |
| keyword     | VARCHAR(255) |                    |              | 关键字                      |
| description | TEXT         |                    |              | 实验室说明                  |
| created_at  | DATETIME     | NOT NULL           |              | 操作时间                    |

👉 索引建议：

- INDEX(lab_id)
- INDEX(operator_id)
- INDEX(created_at)

---

## 📝 user_log（用户日志）

| 字段名        | 类型         | 约束               | 外键         | 备注                            |
| ------------- | ------------ | ------------------ | ------------ | ------------------------------- |
| id            | INT          | PK, AUTO_INCREMENT |              | 日志ID                          |
| user_id       | INT          | NOT NULL           | FK → user.id | 被操作用户ID                    |
| operator_id   | INT          |                    | FK → user.id | 操作人（可NULL）                |
| action        | VARCHAR(20)  | NOT NULL           |              | create/update/delete            |
| name          | VARCHAR(100) |                    |              | 用户名                          |
| password_hash | VARCHAR(255) |                    |              | 密码哈希                        |
| role          | SMALLINT     |                    |              | 角色                            |
| phone         | VARCHAR(20)  |                    |              | 手机号                          |
| email         | VARCHAR(100) |                    |              | 邮箱                            |
| avatar_url    | VARCHAR(255) |                    |              | 头像                            |
| is_active     | SMALLINT     |                    |              | 是否启用 (0-正常 1-封禁 2-注销) |
| created_at    | DATETIME     | NOT NULL           |              | 操作时间                        |

👉 索引建议：

- INDEX(user_id)
- INDEX(operator_id)
- INDEX(created_at)

---

## 📝 tag_log（标签日志）

| 字段名      | 类型         | 约束               | 外键         | 备注                 |
| ----------- | ------------ | ------------------ | ------------ | -------------------- |
| id          | INT          | PK, AUTO_INCREMENT |              | 日志ID               |
| tag_id      | INT          | NOT NULL           | FK → tag.id  | 被操作的标签ID       |
| operator_id | INT          |                    | FK → user.id | 操作人（可NULL）     |
| action      | VARCHAR(20)  | NOT NULL           |              | create/update/delete |
| name        | VARCHAR(50)  |                    |              | 标签名               |
| description | VARCHAR(255) |                    |              | 描述                 |
| created_at  | DATETIME     | NOT NULL           |              | 操作时间             |

👉 索引建议：

- INDEX(tag_id)
- INDEX(operator_id)
- INDEX(created_at)

---

## 📝 lab_user_log（实验室负责人日志）

| 字段名      | 类型        | 约束               | 外键         | 备注                       |
| ----------- | ----------- | ------------------ | ------------ | -------------------------- |
| id          | INT         | PK, AUTO_INCREMENT |              | 日志ID                     |
| lab_user_id | INT         | NOT NULL           |              | 被操作的记录ID（不做外键） |
| lab_id      | INT         | NOT NULL           | FK → lab.id  | 实验室                     |
| user_id     | INT         | NOT NULL           | FK → user.id | 用户                       |
| operator_id | INT         |                    | FK → user.id | 操作人（可NULL）           |
| action      | VARCHAR(20) | NOT NULL           |              | create/update/delete       |
| is_active   | SMALLINT    |                    |              | 是否有效 (0-正常 1-无效)   |
| created_at  | DATETIME    | NOT NULL           |              | 操作时间                   |

👉 索引建议：

- INDEX(lab_user_id)
- INDEX(lab_id)
- INDEX(user_id)
- INDEX(operator_id)
- INDEX(created_at)

---

## 📝 tag_user_log（标签负责人日志）

| 字段名      | 类型        | 约束               | 外键         | 备注                       |
| ----------- | ----------- | ------------------ | ------------ | -------------------------- |
| id          | INT         | PK, AUTO_INCREMENT |              | 日志ID                     |
| tag_user_id | INT         | NOT NULL           |              | 被操作的记录ID（不做外键） |
| tag_id      | INT         | NOT NULL           | FK → tag.id  | 标签                       |
| user_id     | INT         | NOT NULL           | FK → user.id | 用户                       |
| operator_id | INT         |                    | FK → user.id | 操作人（可NULL）           |
| action      | VARCHAR(20) | NOT NULL           |              | create/update/delete       |
| created_at  | DATETIME    | NOT NULL           |              | 操作时间                   |

👉 索引建议：

- INDEX(tag_user_id)
- INDEX(tag_id)
- INDEX(user_id)
- INDEX(operator_id)
- INDEX(created_at)

---

# 🧱 最终表清单

```text
user
lab
tag
instrument

lab_user
tag_user

reservation
approval

instrument_log
lab_log
user_log
tag_log
lab_user_log
tag_user_log
```

---

> ✅ **结构规范（3NF基本满足）**
> ✅ **可直接 ORM 建模**
> ✅ **支持审批流**
> ✅ **支持 AI 扩展（日志 + keyword + purpose）**
> ✅ **日志系统完整，支持操作溯源**
