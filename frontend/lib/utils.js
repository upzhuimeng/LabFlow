// -*- coding: utf-8 -*-
// File: utils.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 工具函数

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  let d;
  if (typeof date === 'string') {
    const dateStr = date.endsWith('Z') ? date : date.replace('T', ' ');
    d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = date.split(/[- T:]/);
      if (parts.length >= 5) {
        d = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          parseInt(parts[3] || 0),
          parseInt(parts[4] || 0),
          parseInt(parts[5] || 0)
        );
      }
    }
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

export function formatDateTime(date) {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

export function formatDateTimeShort(date) {
  return formatDate(date, 'MM-DD HH:mm');
}

export function formatTime(date) {
  return formatDate(date, 'HH:mm');
}

export function parseDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
}

export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isFuture(date) {
  if (!date) return false;
  return new Date(date) > new Date();
}

export function isPast(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function getDateDiff(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate - startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0分钟';
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`;
}

export function formatPrice(price) {
  if (price === null || price === undefined) return '-';
  const num = parseFloat(price);
  if (isNaN(num)) return '-';
  return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function truncate(str, length = 20) {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, delay = 300) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

export function generateOptions(array, labelKey = 'name', valueKey = 'id') {
  if (!Array.isArray(array)) return [];
  return array.map(item => ({
    label: item[labelKey],
    value: item[valueKey],
  }));
}

export function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const query = Object.entries(params)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
}

export function parseQueryString(queryString) {
  if (!queryString || typeof queryString !== 'string') return {};
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  const result = {};
  query.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  return result;
}

export function getErrorMessage(error) {
  if (!error) return '未知错误';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.detail) return error.response.data.detail;
  return '请求失败';
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const result = document.execCommand('copy');
  document.body.removeChild(textarea);
  return result;
}

export default {
  formatDate,
  formatDateTime,
  formatDateTimeShort,
  formatTime,
  parseDate,
  isToday,
  isFuture,
  isPast,
  getDateDiff,
  formatDuration,
  formatPrice,
  truncate,
  debounce,
  throttle,
  generateOptions,
  buildQueryString,
  parseQueryString,
  getErrorMessage,
  copyToClipboard,
};
