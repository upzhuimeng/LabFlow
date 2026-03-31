// -*- coding: utf-8 -*-
// File: api.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 统一API服务层

import config from '@/config';
import { getErrorMessage } from './utils';

const BASE_URL = config.API_BASE_URL;
const REQUEST_TIMEOUT = config.REQUEST_TIMEOUT || 30000;

class ApiError extends Error {
  constructor(code, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

async function request(url, options = {}) {
  const { method = 'GET', body, params, headers = {}, ...rest } = options;
  
  const queryString = params 
    ? '?' + new URLSearchParams(params).toString()
    : '';
  
  const fullUrl = `${BASE_URL}${url}${queryString}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  try {
    const response = await fetch(fullUrl, {
      method,
      credentials: 'include',
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...rest,
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.detail || `HTTP ${response.status}`,
        data
      );
    }
    
    if (data.code !== 200 && data.code !== undefined) {
      throw new ApiError(data.code, data.message || '请求失败', data);
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ApiError(408, '请求超时');
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, getErrorMessage(error));
  }
}

export async function get(url, options = {}) {
  return request(url, { ...options, method: 'GET' });
}

export async function post(url, body, options = {}) {
  return request(url, { ...options, method: 'POST', body });
}

export async function put(url, body, options = {}) {
  return request(url, { ...options, method: 'PUT', body });
}

export async function patch(url, body, options = {}) {
  return request(url, { ...options, method: 'PATCH', body });
}

export async function del(url, options = {}) {
  return request(url, { ...options, method: 'DELETE' });
}

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  request,
};

export { ApiError };
export default api;
