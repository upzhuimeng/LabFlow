//详情模态框组件

'use client';

import { useState, useEffect } from 'react';

export default function InstrumentModal({ isOpen, onClose, onSubmit, initialData, variant = 'full' }) {
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        serialNumber: '',
        location: '',
        purchaseDate: '',
        supplier: '',
        warrantyExpiry: '',
        maintenanceCycle: '',
        status: '可用',
        description: '',
    });

    // 当 initialData 变化时填充表单（用于编辑）
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                model: initialData.model || '',
                serialNumber: initialData.serialNumber || '',
                location: initialData.location || '',
                purchaseDate: initialData.purchaseDate || '',
                supplier: initialData.supplier || '',
                warrantyExpiry: initialData.warrantyExpiry || '',
                maintenanceCycle: initialData.maintenanceCycle || '',
                status: initialData.status || '可用',
                description: initialData.description || '',
            });
        } else {
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const isQuick = variant === 'quick';

    // 快速编辑字段（仅用于列表页编辑）
    const renderQuickFields = () => (
        <>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    设备名称 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="请输入设备名称"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    位置 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="例如：A栋301室"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">状态</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    <option value="可用">可用</option>
                    <option value="维修中">维修中</option>
                    <option value="使用中">使用中</option>
                    <option value="故障">故障</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">购买日期</label>
                <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">供应商</label>
                <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="请输入供应商名称"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
        </>
    );

    // 完整编辑字段（用于新增和详情页编辑）
    const renderFullFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    设备名称 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="请输入设备名称"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    设备型号 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    placeholder="请输入设备型号"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    序列号 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    required
                    placeholder="请输入序列号"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">
                    位置 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="例如：A栋301室"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">购买日期</label>
                <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">供应商</label>
                <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="请输入供应商名称"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">保修期至</label>
                <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">维护周期</label>
                <select
                    name="maintenanceCycle"
                    value={formData.maintenanceCycle}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    <option value="">请选择维护周期</option>
                    <option value="每月">每月</option>
                    <option value="每季度">每季度</option>
                    <option value="每半年">每半年</option>
                    <option value="每年">每年</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">初始状态</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    <option value="可用">可用</option>
                    <option value="维修中">维修中</option>
                    <option value="使用中">使用中</option>
                    <option value="故障">故障</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 遮罩层 */}
            <div className="fixed inset-0 bg-black/30 transition-opacity"></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-xl rounded-lg bg-white shadow-xl text-lg max-h-[90vh] overflow-y-auto">
                    {/* 标题 */}
                    <div className="border-b border-gray-300/70 px-6 py-4">
                        <h3 className="text-xl font-semibold">
                            {initialData ? (isQuick ? '快速编辑设备' : '编辑设备') : '添加新设备'}
                        </h3>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-10 space-y-4">
                            {isQuick ? renderQuickFields() : renderFullFields()}
                            {/* 设备描述（仅完整表单显示） */}
                            {!isQuick && (
                                <div>
                                    <label className="block mb-1 text-base font-medium text-gray-700">设备描述</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="请输入设备描述信息"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        {/* 底部按钮 */}
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
                                {initialData ? '保存修改' : '添加设备'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}