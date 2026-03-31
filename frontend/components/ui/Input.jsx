// -*- coding: utf-8 -*-
// File: Input.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 输入框组件

export default function Input({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false,
    className = '',
    ...props
}) {
    const inputClasses = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
        error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={inputClasses}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
