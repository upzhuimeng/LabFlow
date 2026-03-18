//仪器详情页

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useInstruments } from '../context/InstrumentContext';
import StatusBadge from '../components/Status';
import InstrumentModal from '../components/InstrumentModal';

// 模拟权限
const MOCK_PERMISSIONS = ['create_asset', 'edit_info', 'edit_status', 'apply_transfer'];

// 模拟预约记录
const MOCK_RESERVATIONS = [
    {
        id: 101,
        user: '张三',
        purpose: "蛋白质分析实验",
        startTime: '2025-04-01 10:00',
        endTime: '2025-04-01 12:00',
        status: '已通过'
    },
    {
        id: 102,
        user: '李四',
        purpose: "样品检测",
        startTime: '2025-04-02 14:00',
        endTime: '2025-04-02 16:00',
        status: '待审批'
    },
];

export default function InstrumentDetailPage() {
    const { id } = useParams();
    const { instruments, updateInstrument } = useInstruments();
    const instrument = instruments.find(i => i.id === Number(id));
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(instrument?.status || '可用');

    if (!instrument) {
        return <div className="p-6">仪器不存在</div>;
    }

    const handleEditSubmit = (formData) => {
        updateInstrument(instrument.id, formData);
        setIsEditModalOpen(false);
    };

    const handleStatusUpdate = () => {
        updateInstrument(instrument.id, { status: selectedStatus });
        setIsStatusModalOpen(false);
    };

    const permissions = MOCK_PERMISSIONS;
    const canApplyTransfer = permissions.includes('apply_transfer');
    const canChangeStatus = permissions.includes('edit_status');
    const canCreateReservation = permissions.includes('create_asset');

    return (
        <div className="container mx-auto p-6">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/instrument"
                    className="flex items-center border border-gray-300 bg-white hover:bg-gray-300 text-gray-600 py-3 px-3 rounded transition-colors"
                >
                    <span className="mr-1 leading-none">← 返回</span>
                </Link>
                <h1 className="text-2xl font-bold mt-3">{instrument.name}</h1>
                <div className="w-20"></div>
            </div>

            {/* 设备信息卡片 */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6 my-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h2 className="text-lg font-semibold mb-4">设备信息</h2>
                <div className="border-t border-gray-300/70 my-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div><span className="font-medium">设备名称：</span>{instrument.name}</div>
                    <div><span className="font-medium">型号：</span>{instrument.model || '未知'}</div>
                    <div><span className="font-medium">序列号：</span>{instrument.serialNumber || '未知'}</div>
                    <div><span className="font-medium">位置：</span>{instrument.location}</div>
                    <div><span className="font-medium">购买日期：</span>{instrument.purchaseDate}</div>
                    <div><span className="font-medium">供应商：</span>{instrument.supplier}</div>
                    <div><span className="font-medium">保修期：</span>{instrument.warrantyExpiry || '未填写'}</div>
                    <div><span className="font-medium">维护周期：</span>{instrument.maintenanceCycle}</div>
                    <div className="md:col-span-2 flex items-center">
                        <span className="font-medium mr-2">状态：</span>
                        <StatusBadge status={instrument.status} />
                    </div>
                </div>
                <div className="border-t border-gray-300/50 my-6"></div>
                {/* 操作按钮 */}
                <div className="flex gap-3 mt-6 justify-end">
                    {canApplyTransfer && (
                        <button className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-600">
                            移用申请
                        </button>
                    )}
                    {canChangeStatus && (
                        <button
                            onClick={() => {
                                setSelectedStatus(instrument.status);
                                setIsStatusModalOpen(true);
                            }}
                            className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-600"
                        >
                            修改状态
                        </button>
                    )}
                    {permissions.includes('edit_info') && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            编辑信息
                        </button>
                    )}
                </div>
            </div>

            {/* 预约记录卡片 */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">预约记录</h2>
                    {canCreateReservation && (
                        <button className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-700">
                            添加预约
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="w-2/6 py-2 px-4 border text-center">日期时间</th>
                            <th className="w-1/6 py-2 px-4 border text-center">申请人</th>
                            <th className="w-1/6 py-2 px-4 border text-center">用途</th>
                            <th className="w-1/6 py-2 px-4 border text-center">状态</th>
                            <th className="w-1/6 py-2 px-4 border text-center">操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {MOCK_RESERVATIONS.map(res => (
                            <tr key={res.id}>
                                <td className="py-2 px-4 border text-center">
                                    {res.startTime} - {res.endTime}
                                </td>
                                <td className="py-2 px-4 border text-center">{res.user}</td>
                                <td className="py-2 px-4 border text-center">{res.purpose}</td>
                                <td className="py-2 px-4 border text-center">
                                    <StatusBadge status={res.status} />
                                </td>
                                <td className="py-2 px-4 border text-center">
                                    <Link href={`/reservations/${res.id}`} className="text-blue-500 hover:underline">
                                        详情
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 编辑信息模态框（完整表单） */}
            <InstrumentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                initialData={instrument}
                variant="full"
            />

            {/* 修改状态模态框 */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/30 transition-opacity"></div>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
                            <div className="border-b border-gray-300/70 px-6 py-4">
                                <h3 className="text-xl font-semibold">修改状态</h3>
                            </div>
                            <div className="px-6 py-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700">选择新状态</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="可用">可用</option>
                                    <option value="维修中">维修中</option>
                                    <option value="使用中">使用中</option>
                                    <option value="故障">故障</option>
                                </select>
                            </div>
                            <div className="border-t border-gray-300/70 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    确认
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
