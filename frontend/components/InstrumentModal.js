//详情模态框组件

'use client';

import { useState, useEffect } from 'react';

export default function InstrumentModal({ isOpen, onClose, onSubmit, initialData, variant = 'full' }) {
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        manufacturer: '',
        supplier: '',
        purchase_date: '',
        price: '',
        status: 0,          // 0-正常 1-维修 2-停用
        lab_id: '',
        remark: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                model: initialData.model || '',
                manufacturer: initialData.manufacturer || '',
                supplier: initialData.supplier || '',
                purchase_date: initialData.purchase_date || '',
                price: initialData.price || '',
                status: initialData.status ?? 0,
                lab_id: initialData.lab_id || '',
                remark: initialData.remark || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            // price 转成数字（浮点数），如果为空则设为 null（或 undefined）
            price: formData.price ? parseFloat(formData.price) : null,
            // lab_id 转成整数，如果为空则设为 null
            lab_id: formData.lab_id ? parseInt(formData.lab_id, 10) : null,
            // status 转成整数（必填）
            status: parseInt(formData.status, 10),
        };
        onSubmit(payload);
    };

    if (!isOpen) return null;

    const isQuick = variant === 'quick';

    // 快速编辑字段（列表页行内编辑用）
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">状态</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                    <option value={0}>正常</option>
                    <option value={1}>维修</option>
                    <option value={2}>停用</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">购买日期</label>
                <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">厂商</label>
                <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label className="block mb-1 text-base font-medium text-gray-700">供应商</label>
                <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
            </div>
        </>
    );

    // 完整表单（新增或详情页编辑用）
    const renderFullFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium">设备名称 <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">型号</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">厂商</label>
                <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">供应商</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">购买日期</label>
                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">价格</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block mb-1 font-medium">状态</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm">
                    <option value={0}>正常</option>
                    <option value={1}>维修</option>
                    <option value={2}>停用</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 font-medium">实验室ID</label>
                <input type="number" name="lab_id" value={formData.lab_id} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="block mb-1 font-medium">备注</label>
                <textarea name="remark" value={formData.remark} onChange={handleChange} rows="3" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/30 transition-opacity"></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="border-b px-6 py-4">
                        <h3 className="text-xl font-semibold">
                            {initialData ? (isQuick ? '快速编辑' : '编辑设备') : '添加新设备'}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-10 space-y-4">
                            {isQuick ? renderQuickFields() : renderFullFields()}
                        </div>
                        <div className="border-t px-6 py-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">取消</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                {initialData ? '保存修改' : '添加设备'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}