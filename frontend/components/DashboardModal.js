
'use client';

import { useState, useEffect } from 'react';

export default function DashboardModal({ isOpen, onClose, onSave, instrument }) {
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        location: '',
        status: '可用',
        maintenanceInfo: '',
        nextMaintenanceDate: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    // 当instrument变化时填充表单（用于编辑）
    useEffect(() => {
        if (instrument) {
            setFormData({
                name: instrument.name || '',
                model: instrument.model || '',
                location: instrument.location || '',
                status: instrument.status || '可用',
                maintenanceInfo: instrument.maintenanceInfo || '',
                nextMaintenanceDate: instrument.nextMaintenanceDate || '',
                description: instrument.description || '',
            });
        } else {
            // 重置表单为新建设备
            setFormData({
                name: '',
                model: '',
                location: '',
                status: '可用',
                maintenanceInfo: '',
                nextMaintenanceDate: '',
                description: '',
            });
        }
        // 清空错误
        setErrors({});
    }, [instrument]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 清空该字段的错误
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '设备名称不能为空';
        }

        if (!formData.model.trim()) {
            newErrors.model = '设备型号不能为空';
        }

        if (!formData.location.trim()) {
            newErrors.location = '位置不能为空';
        }

        if (formData.nextMaintenanceDate && new Date(formData.nextMaintenanceDate) < new Date()) {
            newErrors.nextMaintenanceDate = '下次维护日期不能早于今天';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // 格式化日期
        const formattedData = {
            ...formData,
            id: instrument?.id || Date.now().toString(),
            createdAt: instrument?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSave(formattedData);
    };

    if (!isOpen) return null;

    // 状态选项
    const statusOptions = [
        { value: 'available', label: '可用' },
        { value: 'maintenance', label: '维修中' },
        { value: 'reserved', label: '使用中' },
        { value: 'fault', label: '故障' }
    ];

    // 维护周期选项
    const maintenanceOptions = [
        { value: 'monthly', label: '每月' },
        { value: 'quarterly', label: '每季度' },
        { value: 'semi-annually', label: '每半年' },
        { value: 'annually', label: '每年' },
        { value: 'custom', label: '自定义' }
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl text-lg max-h-[90vh] overflow-y-auto">
                    {/* 标题 */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {instrument ? '编辑设备' : '添加新设备'}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">关闭</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            请填写设备信息，带 <span className="text-red-500">*</span> 的为必填项
                        </p>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4 space-y-4">
                            {/* 基本信息 */}
                            <div>
                                <h4 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b">基本信息</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 设备名称 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            设备名称 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="请输入设备名称"
                                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* 设备型号 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            设备型号 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            required
                                            placeholder="请输入设备型号"
                                            className={`w-full border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                        />
                                        {errors.model && (
                                            <p className="mt-1 text-sm text-red-500">{errors.model}</p>
                                        )}
                                    </div>

                                    {/* 位置 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            位置 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            placeholder="例如：A栋301室"
                                            className={`w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                                        )}
                                    </div>

                                    {/* 状态 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            状态 <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 维护信息 */}
                            <div>
                                <h4 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b">维护信息</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 维护周期 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            维护周期
                                        </label>
                                        <select
                                            name="maintenanceCycle"
                                            value={formData.maintenanceCycle || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === 'custom') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        maintenanceInfo: '自定义周期'
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        maintenanceInfo: value ? `${value}维护` : '',
                                                        maintenanceCycle: value
                                                    }));
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        >
                                            <option value="">请选择维护周期</option>
                                            {maintenanceOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 下次维护日期 */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            下次维护日期
                                        </label>
                                        <input
                                            type="date"
                                            name="nextMaintenanceDate"
                                            value={formData.nextMaintenanceDate}
                                            onChange={handleChange}
                                            className={`w-full border ${errors.nextMaintenanceDate ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                        />
                                        {errors.nextMaintenanceDate && (
                                            <p className="mt-1 text-sm text-red-500">{errors.nextMaintenanceDate}</p>
                                        )}
                                    </div>

                                    {/* 维护信息 */}
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            维护信息
                                        </label>
                                        <input
                                            type="text"
                                            name="maintenanceInfo"
                                            value={formData.maintenanceInfo}
                                            onChange={handleChange}
                                            placeholder="例如：每月维护一次，或自定义维护说明"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 描述 */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    设备描述
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="请输入设备描述信息，如设备用途、注意事项等"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                ></textarea>
                            </div>
                        </div>

                        {/* 底部按钮 */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {instrument ? '保存修改' : '添加设备'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}