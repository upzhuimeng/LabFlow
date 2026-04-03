// -*- coding: utf-8 -*-
// File: index.js
// Created: 2026-03-29
// Author: zhuimeng
// Description: 前端配置文件

const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',

  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
    },
    INSTRUMENT: {
      LIST: '/instruments',
      DETAIL: (id) => `/instruments/${id}`,
    },
    LAB: {
      LIST: '/labs',
      DETAIL: (id) => `/labs/${id}`,
    },
    RESERVATION: {
      LIST: '/reservations',
      DETAIL: (id) => `/reservations/${id}`,
      APPROVE: (id) => `/approvals/reservations/${id}/approve`,
      REJECT: (id) => `/approvals/reservations/${id}/reject`,
    },
    USER: {
      LIST: '/users',
      DETAIL: (id) => `/users/${id}`,
      ME: '/users/me',
    },
    APPROVAL: {
      PENDING: '/approvals/pending',
    },
  },

  PAGE_SIZE: {
    DEFAULT: 10,
    INSTRUMENT: 10,
    LAB: 10,
    RESERVATION: 10,
  },

  STATUS: {
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
  },

  STATUS_TEXT: {
    INSTRUMENT: {
      0: '正常',
      1: '维修',
      2: '停用',
    },
    LAB: {
      0: '正常',
      1: '维护',
      2: '停用',
    },
    USER: {
      0: '正常',
      1: '封禁',
      2: '注销',
    },
    RESERVATION: {
      0: '审批中',
      1: '通过',
      2: '拒绝',
      3: '取消',
      4: '草稿',
    },
  },

  ROLE: {
    SUPER_ADMIN: 0,
    ADMIN: 1,
    LAB_USER: 2,
  },

  ROLE_TEXT: {
    0: '超级管理员',
    1: '管理员',
    2: '实验员',
  },

  TOKEN_KEY: 'access_token',

  REQUEST_TIMEOUT: 30000,
};

export default config;
