// -*- coding: utf-8 -*-
// File: LabContext.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 实验室状态管理 Context

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import config from '@/config';

const LabContext = createContext();

export function LabProvider({ children }) {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentLab, setCurrentLab] = useState(null);

    const getHeaders = useCallback(() => {
        const headers = { 'Content-Type': 'application/json' };
        const token = typeof window !== 'undefined' 
            ? localStorage.getItem(config.TOKEN_KEY) 
            : null;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }, []);

    const fetchLabs = useCallback(async (page = 1, pageSize = config.PAGE_SIZE.LAB) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${config.API_BASE_URL}${config.API_ENDPOINTS.LAB.LIST}?page=${page}&page_size=${pageSize}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取实验室列表失败');
            const result = await res.json();
            setLabs(result.data || result);
            setTotal(result.total || result.length);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const getLab = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.LAB.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取实验室详情失败');
            const data = await res.json();
            setCurrentLab(data.data || data);
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const addLab = useCallback(async (newLab) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.LAB.LIST}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(newLab),
            });
            if (!res.ok) throw new Error('添加实验室失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const updateLab = useCallback(async (id, updatedData) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.LAB.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('更新实验室失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const deleteLab = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.LAB.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('删除实验室失败');
            setLabs(prev => prev.filter(lab => lab.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    return (
        <LabContext.Provider
            value={{
                labs,
                loading,
                error,
                total,
                currentLab,
                fetchLabs,
                getLab,
                addLab,
                updateLab,
                deleteLab,
            }}
        >
            {children}
        </LabContext.Provider>
    );
}

export function useLabs() {
    const context = useContext(LabContext);
    if (!context) {
        throw new Error('useLabs must be used within a LabProvider');
    }
    return context;
}

export default LabContext;
