// -*- coding: utf-8 -*-
// File: InstrumentContext.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 仪器状态管理 Context

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import config from '@/config';

const InstrumentContext = createContext();

export function InstrumentProvider({ children }) {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentInstrument, setCurrentInstrument] = useState(null);

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

    const fetchInstruments = useCallback(async (page = 1, pageSize = config.PAGE_SIZE.INSTRUMENT) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${config.API_BASE_URL}${config.API_ENDPOINTS.INSTRUMENT.LIST}?page=${page}&page_size=${pageSize}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取仪器列表失败');
            const result = await res.json();
            setInstruments(result.data || result);
            setTotal(result.total || result.length);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const getInstrument = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.INSTRUMENT.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取仪器详情失败');
            const data = await res.json();
            setCurrentInstrument(data.data || data);
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const addInstrument = useCallback(async (newInstrument) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.INSTRUMENT.LIST}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(newInstrument),
            });
            if (!res.ok) throw new Error('添加仪器失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const updateInstrument = useCallback(async (id, updatedData) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.INSTRUMENT.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('更新仪器失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const deleteInstrument = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.INSTRUMENT.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('删除仪器失败');
            setInstruments(prev => prev.filter(inst => inst.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    return (
        <InstrumentContext.Provider
            value={{
                instruments,
                loading,
                error,
                total,
                currentInstrument,
                fetchInstruments,
                getInstrument,
                addInstrument,
                updateInstrument,
                deleteInstrument,
            }}
        >
            {children}
        </InstrumentContext.Provider>
    );
}

export function useInstruments() {
    const context = useContext(InstrumentContext);
    if (!context) {
        throw new Error('useInstruments must be used within an InstrumentProvider');
    }
    return context;
}

export default InstrumentContext;
