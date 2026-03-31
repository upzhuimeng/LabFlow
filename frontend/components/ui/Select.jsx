// -*- coding: utf-8 -*-
// File: Select.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 选择框组件

export default function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    disabled = false,
    error,
    className = '',
    placeholder = '请选择',
    ...props
}) {
    const selectClasses = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
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
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={selectClasses}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
