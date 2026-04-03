// -*- coding: utf-8 -*-
// File: Modal.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 统一模态框组件

'use client';

import { useEffect } from 'react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    footer,
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/30 transition-opacity"
                onClick={onClose}
            />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative w-full ${sizeClasses[size]} rounded-lg bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col`}
                >
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            {title && (
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {title}
                                </h3>
                            )}
                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none ml-auto"
                                >
                                    <span className="sr-only">关闭</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {children}
                    </div>
                    {footer && (
                        <div className="border-t px-6 py-4 bg-gray-50">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
