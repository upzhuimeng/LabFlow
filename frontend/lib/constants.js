// -*- coding: utf-8 -*-
// File: constants.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 统一常量定义

export const STATUS = {
  INSTRUMENT: {
    NORMAL: 0,
    MAINTENANCE: 1,
    DISABLED: 2,
  },
  LAB: {
    NORMAL: 0,
    MAINTENANCE: 1,
    DISABLED: 2,
  },
  USER: {
    ACTIVE: 0,
    BANNED: 1,
    DELETED: 2,
  },
  RESERVATION: {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    CANCELLED: 3,
    DRAFT: 4,
  },
  LAB_USER: {
    ACTIVE: 0,
    INACTIVE: 1,
  },
};

export const STATUS_TEXT = {
  INSTRUMENT: {
    [STATUS.INSTRUMENT.NORMAL]: '正常',
    [STATUS.INSTRUMENT.MAINTENANCE]: '维修中',
    [STATUS.INSTRUMENT.DISABLED]: '停用',
  },
  LAB: {
    [STATUS.LAB.NORMAL]: '正常',
    [STATUS.LAB.MAINTENANCE]: '维护中',
    [STATUS.LAB.DISABLED]: '停用',
  },
  USER: {
    [STATUS.USER.ACTIVE]: '正常',
    [STATUS.USER.BANNED]: '封禁',
    [STATUS.USER.DELETED]: '注销',
  },
  RESERVATION: {
    [STATUS.RESERVATION.PENDING]: '审批中',
    [STATUS.RESERVATION.APPROVED]: '已通过',
    [STATUS.RESERVATION.REJECTED]: '已拒绝',
    [STATUS.RESERVATION.CANCELLED]: '已取消',
    [STATUS.RESERVATION.DRAFT]: '草稿',
  },
};

export const STATUS_COLOR = {
  INSTRUMENT: {
    [STATUS.INSTRUMENT.NORMAL]: 'green',
    [STATUS.INSTRUMENT.MAINTENANCE]: 'yellow',
    [STATUS.INSTRUMENT.DISABLED]: 'gray',
  },
  LAB: {
    [STATUS.LAB.NORMAL]: 'green',
    [STATUS.LAB.MAINTENANCE]: 'yellow',
    [STATUS.LAB.DISABLED]: 'gray',
  },
  USER: {
    [STATUS.USER.ACTIVE]: 'green',
    [STATUS.USER.BANNED]: 'red',
    [STATUS.USER.DELETED]: 'gray',
  },
  RESERVATION: {
    [STATUS.RESERVATION.PENDING]: 'blue',
    [STATUS.RESERVATION.APPROVED]: 'green',
    [STATUS.RESERVATION.REJECTED]: 'red',
    [STATUS.RESERVATION.CANCELLED]: 'gray',
    [STATUS.RESERVATION.DRAFT]: 'gray',
  },
};

export const ROLE = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  LAB_USER: 2,
};

export const ROLE_TEXT = {
  [ROLE.SUPER_ADMIN]: '超级管理员',
  [ROLE.ADMIN]: '管理员',
  [ROLE.LAB_USER]: '实验员',
};

export const PERMISSION = {
  CAN_VIEW_INSTRUMENT: 'can_view_instrument',
  CAN_CREATE_INSTRUMENT: 'can_create_instrument',
  CAN_EDIT_INSTRUMENT: 'can_edit_instrument',
  CAN_DELETE_INSTRUMENT: 'can_delete_instrument',
  CAN_VIEW_LAB: 'can_view_lab',
  CAN_CREATE_LAB: 'can_create_lab',
  CAN_EDIT_LAB: 'can_edit_lab',
  CAN_DELETE_LAB: 'can_delete_lab',
  CAN_CREATE_RESERVATION: 'can_create_reservation',
  CAN_APPROVE_RESERVATION: 'can_approve_reservation',
  CAN_MANAGE_USER: 'can_manage_user',
};

export const ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const PAGE_SIZE = {
  DEFAULT: 10,
  INSTRUMENT: 10,
  LAB: 10,
  RESERVATION: 10,
  USER: 10,
};

export default {
  STATUS,
  STATUS_TEXT,
  STATUS_COLOR,
  ROLE,
  ROLE_TEXT,
  PERMISSION,
  ACTION,
  PAGE_SIZE,
};
