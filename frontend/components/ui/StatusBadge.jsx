// -*- coding: utf-8 -*-
// File: StatusBadge.jsx
// Created: 2026-03-29
// Author: zhuimeng (based on Status.js by teammate)
// Description: 统一状态徽章组件

import config from '@/config';

export default function StatusBadge({ status, type = 'instrument', className = '' }) {
    const statusTextMap = config.STATUS_TEXT[type] || config.STATUS_TEXT.INSTRUMENT;
    const statusColorMap = {
        0: 'bg-green-100 text-green-800',
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-gray-100 text-gray-800',
    };

    const text = statusTextMap[status] || statusTextMap[0] || '未知';
    const color = statusColorMap[status] || statusColorMap[0];

    return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${color} ${className}`}>
            {text}
        </span>
    );
}
