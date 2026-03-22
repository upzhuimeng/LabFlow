'use client';

import React from 'react';
import Status from './Status';

const DashboardTable = ({ instruments, onInstrumentAction }) => {
    // 将英文状态转换为中文状态
    const getChineseStatus = (status) => {
        const statusMap = {
            'available': '可用',
            'maintenance': '维修中',
            'reserved': '使用中',
            'fault': '故障'
        };
        return statusMap[status] || status;
    };

    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        仪器名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        型号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        位置
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        维护信息
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {instruments.map((instrument) => {
                    const chineseStatus = getChineseStatus(instrument.status);

                    return (
                        <tr key={instrument.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {instrument.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{instrument.model}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{instrument.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Status
                                        status={chineseStatus}
                                        className="text-sm font-medium"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {instrument.maintenanceInfo || '暂无维护信息'}
                                </div>
                                {instrument.nextMaintenanceDate && (
                                    <div className="text-sm text-gray-500">
                                        下次维护: {formatDate(instrument.nextMaintenanceDate)}
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* 空状态 */}
            {instruments.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">暂无仪器数据</div>
                    <div className="text-gray-500">请添加仪器或检查数据源</div>
                </div>
            )}
        </div>
    );
};

export default DashboardTable;