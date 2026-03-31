// -*- coding: utf-8 -*-
// File: EmptyState.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 空状态组件

import Button from './Button';

export default function EmptyState({
    icon,
    title,
    description,
    actionText,
    onAction,
}) {
    return (
        <div className="text-center py-12">
            {icon && (
                <div className="text-gray-300 text-6xl mb-4 flex justify-center">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title || '暂无数据'}
            </h3>
            {description && (
                <p className="text-gray-500 mb-6">{description}</p>
            )}
            {actionText && onAction && (
                <Button onClick={onAction}>
                    {actionText}
                </Button>
            )}
        </div>
    );
}
