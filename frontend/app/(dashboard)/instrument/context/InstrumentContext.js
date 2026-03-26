'use client';
import {createContext, useState, useContext, useEffect, useCallback} from 'react';

const InstrumentContext = createContext();
const API_BASE = 'http://localhost:8000/instrument';

export function InstrumentProvider({ children }) {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentInstrument, setCurrentInstrument] = useState(null);

    // 获取仪器列表（支持分页）
    const fetchInstruments = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const url = `${API_BASE}?page=${page}&pagesize=${pageSize}`;
            const res = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('获取仪器列表失败');
            const result = await res.json();
            // 假设后端返回格式 { data: [], total: number }
            setInstruments(result.data || result);
            setTotal(result.total || result.length);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    },[]);

    // 页面初始加载时获取第一页数据
    useEffect(() => {
        fetchInstruments();
    }, []);

    // 新增仪器
    const addInstrument = useCallback(async (newInstrument) => {
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInstrument),
            });
            if (!res.ok) throw new Error('添加仪器失败');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    },[]);

    // 更新仪器
    const updateInstrument = useCallback(async (id, updatedData) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('更新仪器失败');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    },[]);

    // 获取单个仪器详情
    const getInstrument = useCallback(async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('获取仪器详情失败');
            const data = await res.json();
            setCurrentInstrument(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },[]);

    return (
        <InstrumentContext.Provider
            value={{
                instruments,
                loading,
                error,
                total,
                currentInstrument,
                fetchInstruments,
                addInstrument,
                updateInstrument,
                getInstrument,       // 导出
            }}
        >
            {children}
        </InstrumentContext.Provider>
    );
}

export function useInstruments() {
    return useContext(InstrumentContext);
}