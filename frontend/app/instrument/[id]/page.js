//仪器详情页

'use client';

import {useParams} from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../components/Status';

// 模拟权限
const MOCK_PERMISSIONS = [ 'create_asset', 'edit_info', 'edit_status', 'apply_transfer'];

// 模拟仪器数据
const MOCK_INSTRUMENTS = [
    {
        id: 1,
        name: '高效液相色谱仪',
        location: 'A101',
        status: '可用',
        purchaseDate: '2020-01-01',
        supplier: '某公司',
        description: '每月'
    },
    {
        id: 2,
        name: '离心机',
        location: 'B202',
        status: '维修中',
        purchaseDate: '2019-05-01',
        supplier: '某科技',
        description: '每季度'
    },
];

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
    const {id} = useParams();
    const instrument = MOCK_INSTRUMENTS.find(i => i.id === Number(id));
    const permissions = MOCK_PERMISSIONS;

    if (!instrument) {
        return <div className="p-6">仪器不存在</div>;
    }

    const canApplyTransfer = permissions.includes('apply_transfer');
    const canChangeStatus = permissions.includes('edit_status');
    const canCreateReservation = permissions.includes('create_asset'); // 复用创建权限作为“添加预约”的显示条件

    return (
        <div className="container mx-auto p-6">
            {/* 顶部导航：返回 + 仪器名称（居中） */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/instrument"
                    className="flex items-center border border-gray-300 bg-white hover:bg-gray-300 text-gray-600  py-3 px-3 rounded transition-colors"
                >
                    <span className="mr-1 leading-none">← 返回</span>
                </Link>
                <h1 className="text-2xl font-bold mt-3">{instrument.name}</h1>
                <div className="w-20"></div>
                {/* 占位，保持标题居中 */}
            </div>

            {/* 设备信息卡片 */}
            <div
                className="bg-white shadow rounded-lg border border-gray-200 p-6 my-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h2 className="text-lg font-semibold mb-4">设备信息</h2>

                {/* 半透明分割线 */}
                <div className="border-t border-gray-300/70 my-6"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div><span className="font-medium">设备名称：</span>{instrument.location}</div>
                    <div><span className="font-medium">型号：</span>{instrument.location}</div>
                    <div><span className="font-medium">序列号：</span>{instrument.location}</div>
                    <div><span className="font-medium">位置：</span>{instrument.location}</div>
                    <div><span className="font-medium">购买日期：</span>{instrument.purchaseDate}</div>
                    <div><span className="font-medium">供应商：</span>{instrument.supplier}</div>
                    <div><span className="font-medium">保修期：</span>{instrument.location}</div>
                    <div><span className="font-medium">维护周期：</span>{instrument.description}</div>
                    <div className="md:col-span-2 flex items-center">
                        <span className="font-medium mr-2">状态：</span>
                        <StatusBadge status={instrument.status}/>
                    </div>
                </div>
                {/* 半透明分割线 */}
                <div className="border-t border-gray-300/50 my-6"></div>
                {/* 操作按钮（权限控制，颜色模仿图片） */}
                <div className="flex gap-3 mt-6 justify-end">
                    {canApplyTransfer && (
                        <button className="bg-green-400 text-white px-4 py-2 rounded hover:bg-green-600">
                            移用申请
                        </button>
                    )}
                    {canChangeStatus && (
                        <button className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-600">
                            修改状态
                        </button>
                    )}
                    {permissions.includes('edit_info') && (
                        <Link href={`/instruments/${id}/edit`}
                              className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-600">
                            编辑信息
                        </Link>
                    )}
                </div>
            </div>

            {/* 预约记录卡片 */}
            <div
                className="bg-white shadow rounded-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
                                    <StatusBadge status={res.status}/>
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
        </div>
    );
}