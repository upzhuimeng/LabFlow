// -*- coding: utf-8 -*-
// File: Button.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 统一按钮组件

const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    secondary: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent',
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    onClick,
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
