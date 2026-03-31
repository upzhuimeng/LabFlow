// -*- coding: utf-8 -*-
// File: ReservationContext.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 预约状态管理 Context

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import config from '@/config';

const ReservationContext = createContext();

export function ReservationProvider({ children }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentReservation, setCurrentReservation] = useState(null);

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

    const fetchReservations = useCallback(async (page = 1, pageSize = config.PAGE_SIZE.RESERVATION, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.toString(),
                ...params,
            });
            const url = `${config.API_BASE_URL}${config.API_ENDPOINTS.RESERVATION.LIST}?${queryParams}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取预约列表失败');
            const result = await res.json();
            setReservations(result.data || result);
            setTotal(result.total || result.length);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const getReservation = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.RESERVATION.DETAIL(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('获取预约详情失败');
            const data = await res.json();
            setCurrentReservation(data.data || data);
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const createReservation = useCallback(async (reservationData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.RESERVATION.LIST}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(reservationData),
            });
            if (!res.ok) throw new Error('创建预约失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const approveReservation = useCallback(async (id, result, comment = '') => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.RESERVATION.APPROVE(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ result, comment }),
            });
            if (!res.ok) throw new Error('审批失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const rejectReservation = useCallback(async (id, comment = '') => {
        setLoading(true);
        setError(null);
        try {
            const url = config.API_ENDPOINTS.RESERVATION.REJECT(id);
            const res = await fetch(`${config.API_BASE_URL}${url}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ comment }),
            });
            if (!res.ok) throw new Error('拒绝预约失败');
            const data = await res.json();
            return data.data || data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    return (
        <ReservationContext.Provider
            value={{
                reservations,
                loading,
                error,
                total,
                currentReservation,
                fetchReservations,
                getReservation,
                createReservation,
                approveReservation,
                rejectReservation,
            }}
        >
            {children}
        </ReservationContext.Provider>
    );
}

export function useReservations() {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error('useReservations must be used within a ReservationProvider');
    }
    return context;
}

export default ReservationContext;
