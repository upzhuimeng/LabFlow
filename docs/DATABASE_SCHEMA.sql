INFO  [alembic.runtime.migration] Context impl MySQLImpl.
INFO  [alembic.runtime.migration] Generating static SQL
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INFO  [alembic.runtime.migration] Running upgrade  -> ef56d38fbb59, initial_migration
-- Running upgrade  -> ef56d38fbb59

CREATE TABLE lab (
    id INTEGER NOT NULL COMMENT '实验室ID' AUTO_INCREMENT, 
    name VARCHAR(100) NOT NULL COMMENT '名称', 
    address VARCHAR(255) NOT NULL COMMENT '地址', 
    capacity INTEGER COMMENT '容纳人数（NULL-未设置）', 
    status SMALLINT NOT NULL COMMENT '状态(0-正常 1-维护 2-停用)' DEFAULT '0', 
    keyword VARCHAR(255) COMMENT '关键词，用于大模型检索', 
    description TEXT COMMENT '实验室说明', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    updated_at DATETIME COMMENT '更新时间', 
    PRIMARY KEY (id)
);

CREATE TABLE user (
    id INTEGER NOT NULL COMMENT '用户ID' AUTO_INCREMENT, 
    name VARCHAR(50) NOT NULL COMMENT '用户名', 
    password_hash VARCHAR(255) NOT NULL COMMENT '密码', 
    `role` SMALLINT NOT NULL COMMENT '角色（0-超级管理员 1-管理员 2-实验员）' DEFAULT '2', 
    phone VARCHAR(20) NOT NULL COMMENT '电话号码', 
    email VARCHAR(255) COMMENT '邮箱', 
    avatar_url VARCHAR(255) COMMENT '头像', 
    is_active SMALLINT NOT NULL COMMENT '是否启用，0-启用，1-封禁，2-注销' DEFAULT '0', 
    last_login_at DATETIME COMMENT '最后登录时间', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    updated_at DATETIME COMMENT '更新时间', 
    PRIMARY KEY (id), 
    UNIQUE (phone)
);

CREATE UNIQUE INDEX ix_user_email ON user (email);

CREATE UNIQUE INDEX ix_user_name ON user (name);

CREATE TABLE instrument (
    id INTEGER NOT NULL COMMENT '仪器ID' AUTO_INCREMENT, 
    name VARCHAR(100) NOT NULL COMMENT '仪器名称', 
    model VARCHAR(100) NOT NULL COMMENT '仪器型号', 
    manufacturer VARCHAR(255) NOT NULL COMMENT '厂商', 
    supplier VARCHAR(255) NOT NULL COMMENT '供应商', 
    purchase_date DATETIME COMMENT '采购时间', 
    price NUMERIC(10, 2) NOT NULL COMMENT '购入价格', 
    status SMALLINT NOT NULL COMMENT '状态，0-正常 1-维修 2-停用' DEFAULT '0', 
    lab_id INTEGER NOT NULL COMMENT '所属实验室', 
    remark VARCHAR(255) COMMENT '备注', 
    created_at DATETIME NOT NULL COMMENT '创建时间', 
    updated_at DATETIME COMMENT '更新时间', 
    PRIMARY KEY (id), 
    FOREIGN KEY(lab_id) REFERENCES lab (id)
);

CREATE INDEX ix_instrument_lab_id ON instrument (lab_id);

CREATE TABLE lab_user (
    id INTEGER NOT NULL COMMENT 'ID' AUTO_INCREMENT, 
    lab_id INTEGER NOT NULL COMMENT '实验室ID', 
    user_id INTEGER NOT NULL COMMENT '用户ID', 
    created_at DATETIME NOT NULL COMMENT '创建时间', 
    is_active SMALLINT NOT NULL COMMENT '是否有效(0-有效 1-无效)' DEFAULT '0', 
    PRIMARY KEY (id), 
    FOREIGN KEY(lab_id) REFERENCES lab (id), 
    FOREIGN KEY(user_id) REFERENCES user (id), 
    CONSTRAINT lab_user_unique UNIQUE (lab_id, user_id)
);

CREATE TABLE lab_user_log (
    id INTEGER NOT NULL COMMENT '日志ID' AUTO_INCREMENT, 
    lab_user_id INTEGER NOT NULL COMMENT '被操作记录ID', 
    lab_id INTEGER NOT NULL COMMENT '实验室ID', 
    user_id INTEGER NOT NULL COMMENT '用户ID', 
    operator_id INTEGER COMMENT '操作人ID', 
    action VARCHAR(20) NOT NULL COMMENT '操作类型(create/update/delete)', 
    is_active SMALLINT COMMENT '是否有效(0-正常 1-无效)', 
    created_at DATETIME NOT NULL COMMENT '操作时间', 
    PRIMARY KEY (id), 
    FOREIGN KEY(lab_id) REFERENCES lab (id), 
    FOREIGN KEY(operator_id) REFERENCES user (id), 
    FOREIGN KEY(user_id) REFERENCES user (id)
);

CREATE INDEX ix_lab_user_log_created_at ON lab_user_log (created_at);

CREATE INDEX ix_lab_user_log_lab_id ON lab_user_log (lab_id);

CREATE INDEX ix_lab_user_log_lab_user_id ON lab_user_log (lab_user_id);

CREATE INDEX ix_lab_user_log_operator_id ON lab_user_log (operator_id);

CREATE INDEX ix_lab_user_log_user_id ON lab_user_log (user_id);

CREATE TABLE reservation (
    id INTEGER NOT NULL COMMENT '预约ID' AUTO_INCREMENT, 
    user_id INTEGER NOT NULL COMMENT '申请人ID', 
    lab_id INTEGER NOT NULL COMMENT '实验室ID', 
    start_time DATETIME NOT NULL COMMENT '开始时间', 
    end_time DATETIME NOT NULL COMMENT '结束时间', 
    purpose TEXT COMMENT '使用目的', 
    status SMALLINT NOT NULL COMMENT '状态(0-审批中 1-通过 2-拒绝 3-已取消)' DEFAULT '0', 
    is_deleted SMALLINT NOT NULL COMMENT '软删除标记(0-正常 1-已删除)' DEFAULT '0', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    updated_at DATETIME COMMENT '更新时间', 
    PRIMARY KEY (id), 
    FOREIGN KEY(lab_id) REFERENCES lab (id), 
    FOREIGN KEY(user_id) REFERENCES user (id)
);

CREATE INDEX ix_reservation_lab_id ON reservation (lab_id);

CREATE INDEX ix_reservation_user_id ON reservation (user_id);

CREATE TABLE user_log (
    id INTEGER NOT NULL COMMENT '日志ID' AUTO_INCREMENT, 
    user_id INTEGER NOT NULL COMMENT '用户ID', 
    operator_id INTEGER COMMENT '操作人ID', 
    action VARCHAR(20) NOT NULL COMMENT '操作类型(create/update/delete)', 
    name VARCHAR(100) COMMENT '用户名', 
    password_hash VARCHAR(255) COMMENT '密码哈希', 
    `role` SMALLINT COMMENT '角色(保留字段)', 
    phone VARCHAR(20) COMMENT '手机号', 
    email VARCHAR(100) COMMENT '邮箱', 
    avatar_url VARCHAR(255) COMMENT '头像', 
    is_active SMALLINT COMMENT '是否启用(0-正常 1-封禁 2-注销)', 
    created_at DATETIME NOT NULL COMMENT '操作时间', 
    PRIMARY KEY (id), 
    FOREIGN KEY(operator_id) REFERENCES user (id), 
    FOREIGN KEY(user_id) REFERENCES user (id)
);

CREATE INDEX ix_user_log_created_at ON user_log (created_at);

CREATE INDEX ix_user_log_operator_id ON user_log (operator_id);

CREATE INDEX ix_user_log_user_id ON user_log (user_id);

CREATE TABLE approval (
    id INTEGER NOT NULL COMMENT 'ID' AUTO_INCREMENT, 
    reservation_id INTEGER NOT NULL COMMENT '预约ID', 
    approver_id INTEGER NOT NULL COMMENT '审批人ID', 
    status SMALLINT NOT NULL COMMENT '状态(0-通过 1-拒绝)' DEFAULT '0', 
    comment TEXT NOT NULL COMMENT '审批意见', 
    approved_at DATETIME NOT NULL COMMENT '审批时间', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(approver_id) REFERENCES user (id), 
    FOREIGN KEY(reservation_id) REFERENCES reservation (id)
);

CREATE INDEX ix_approval_approver_id ON approval (approver_id);

CREATE INDEX ix_approval_reservation_id ON approval (reservation_id);

CREATE TABLE instrument_log (
    id INTEGER NOT NULL COMMENT 'ID' AUTO_INCREMENT, 
    instrument_id INTEGER NOT NULL COMMENT '仪器ID', 
    operator_id INTEGER COMMENT '操作人ID', 
    action VARCHAR(20) NOT NULL COMMENT '操作类型(create/update/delete)', 
    name VARCHAR(100) COMMENT '仪器名称', 
    model VARCHAR(100) COMMENT '型号', 
    manufacturer VARCHAR(255) COMMENT '厂商', 
    supplier VARCHAR(255) COMMENT '提供商名称', 
    purchase_date DATETIME COMMENT '采购日期', 
    price DECIMAL(10, 2) COMMENT '仪器价格', 
    status SMALLINT NOT NULL COMMENT '状态(0-正常 1-维护 2-停用)', 
    lab_id INTEGER NOT NULL COMMENT '所属实验室', 
    remark VARCHAR(255) COMMENT '备注', 
    created_at DATETIME NOT NULL COMMENT '操作时间' DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(instrument_id) REFERENCES instrument (id), 
    FOREIGN KEY(lab_id) REFERENCES lab (id), 
    FOREIGN KEY(operator_id) REFERENCES user (id)
);

CREATE INDEX ix_instrument_log_created_at ON instrument_log (created_at);

CREATE INDEX ix_instrument_log_instrument_id ON instrument_log (instrument_id);

CREATE INDEX ix_instrument_log_operator_id ON instrument_log (operator_id);

INSERT INTO alembic_version (version_num) VALUES ('ef56d38fbb59');

INFO  [alembic.runtime.migration] Running upgrade ef56d38fbb59 -> 1fa05e15d66e, create notification table
-- Running upgrade ef56d38fbb59 -> 1fa05e15d66e

CREATE TABLE notification (
    id INTEGER NOT NULL COMMENT 'ID' AUTO_INCREMENT, 
    user_id INTEGER NOT NULL COMMENT '接收用户ID', 
    title VARCHAR(100) NOT NULL COMMENT '标题', 
    content TEXT NOT NULL COMMENT '内容', 
    type SMALLINT NOT NULL COMMENT '类型：1-审批结果，2-预约失效，3-系统通知', 
    related_id INTEGER COMMENT '关联ID', 
    is_read SMALLINT NOT NULL COMMENT '是否已读：0-未读，1-已读', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    PRIMARY KEY (id)
);

UPDATE alembic_version SET version_num='1fa05e15d66e' WHERE alembic_version.version_num = 'ef56d38fbb59';

INFO  [alembic.runtime.migration] Running upgrade 1fa05e15d66e -> 90e3a49ab18b, create agent_log table
-- Running upgrade 1fa05e15d66e -> 90e3a49ab18b

CREATE TABLE agent_log (
    id INTEGER NOT NULL COMMENT 'ID' AUTO_INCREMENT, 
    user_id INTEGER NOT NULL COMMENT '用户ID', 
    input_message VARCHAR(500) NOT NULL COMMENT '用户输入摘要', 
    context_file VARCHAR(100) NOT NULL COMMENT '上下文文件路径', 
    is_completed SMALLINT NOT NULL COMMENT '是否完成：0-进行中，1-已完成，2-已放弃', 
    created_at DATETIME NOT NULL COMMENT '创建时间' DEFAULT now(), 
    updated_at DATETIME NOT NULL COMMENT '更新时间' DEFAULT now(), 
    PRIMARY KEY (id)
);

UPDATE alembic_version SET version_num='90e3a49ab18b' WHERE alembic_version.version_num = '1fa05e15d66e';

INFO  [alembic.runtime.migration] Running upgrade 90e3a49ab18b -> 7af038960a21, add attachment to notification
-- Running upgrade 90e3a49ab18b -> 7af038960a21

ALTER TABLE notification ADD COLUMN attachment TEXT COMMENT '附件JSON数据（智能推荐等）';

ALTER TABLE notification MODIFY type SMALLINT(6) NOT NULL COMMENT '类型：1-审批结果，2-预约失效，3-系统通知，4-智能推荐';

UPDATE alembic_version SET version_num='7af038960a21' WHERE alembic_version.version_num = '90e3a49ab18b';

