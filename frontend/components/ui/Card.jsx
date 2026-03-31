// -*- coding: utf-8 -*-
// File: Card.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 统一卡片组件

export default function Card({
    title,
    children,
    className = '',
    hover = false,
    padding = true,
}) {
    return (
        <div
            className={`bg-white rounded-lg shadow border border-gray-200 ${
                hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''
            } ${padding ? 'p-6' : ''} ${className}`}
        >
            {title && (
                <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {title}
                    </h3>
                    <div className="border-t border-gray-200 my-4" />
                </>
            )}
            {children}
        </div>
    );
}
