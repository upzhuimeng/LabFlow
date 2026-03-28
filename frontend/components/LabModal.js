'use client';

import { useState, useEffect } from 'react';

export default function LabModal({ isOpen, onClose, onSubmit, initialData, variant = 'full' }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity: '',
        status: '正常',
        manager: '',
        phone: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                address: initialData.address || '',
                capacity: initialData.capacity || '',
                status: initialData.status || '正常',
                manager: initialData.manager || '',
                phone: initialData.phone || '',
                description: initialData.description || '',
            });
        } else {
            setFormData({
                name: '',
                address: '',
                capacity: '',
                status: '正常',
                manager: '',
                phone: '',
                description: '',
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '请输入实验室名称';
        }

        if (!formData.address.trim()) {
            newErrors.address = '请输入实验室地址';
        }

        if (!formData.capacity) {
            newErrors.capacity = '请输入可容纳人数';
        } else if (!Number.isInteger(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
            newErrors.capacity = '容量必须是正整数';
        }

        if (formData.phone && !/^[\d-]+$/.test(formData.phone)) {
            newErrors.phone = '电话号码格式不正确';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                ...formData,
                capacity: Number(formData.capacity),
            };
            onSubmit(submitData);
        }
    };

    if (!isOpen) return null;

    const isQuick = variant === 'quick';

    const renderInput = (label, name, type = 'text', placeholder, required = false) => (
        <div>
            <label className="block mb-1 text-base font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                placeholder={placeholder}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors[name] ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );

    const renderSelect = (label, name, options) => (
        <div>
            <label className="block mb-1 text-base font-medium text-gray-700">{label}</label>
            <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );

    const renderQuickFields = () => (
        <>
            {renderInput('实验室名称', 'name', 'text', '请输入实验室名称', true)}
            {renderInput('地址', 'address', 'text', '例如：A 栋 301 室', true)}
            {renderInput('可容纳人数', 'capacity', 'number', '例如：20', true)}
            {renderSelect('状态', 'status', ['正常', '维护', '停用'])}
            {renderInput('负责人', 'manager', 'text', '请输入负责人姓名')}
            {renderInput('联系电话', 'phone', 'tel', '请输入联系电话')}
        </>
    );

    const renderFullFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('实验室名称', 'name', 'text', '请输入实验室名称', true)}
            {renderInput('地址', 'address', 'text', '例如：A 栋 301 室', true)}
            {renderInput('可容纳人数', 'capacity', 'number', '例如：20', true)}
            {renderSelect('初始状态', 'status', ['正常', '维护', '停用'])}
            {renderInput('负责人', 'manager', 'text', '请输入负责人姓名')}
            {renderInput('联系电话', 'phone', 'tel', '请输入联系电话')}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/30 transition-opacity"></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-xl rounded-lg bg-white shadow-xl text-lg max-h-[90vh] overflow-y-auto">
                    <div className="border-b border-gray-300/70 px-6 py-4">
                        <h3 className="text-xl font-semibold">
                            {initialData ? (isQuick ? '快速编辑实验室' : '编辑实验室') : '添加新实验室'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-10 space-y-4">
                            {isQuick ? renderQuickFields() : renderFullFields()}
                            {!isQuick && (
                                <div>
                                    <label className="block mb-1 text-base font-medium text-gray-700">实验室描述</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="请输入实验室描述信息"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-300/70 px-6 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                {initialData ? '保存修改' : '添加实验室'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
