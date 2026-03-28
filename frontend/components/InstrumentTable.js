/*仪器列表卡片（根据权限动态列）*/

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useInstruments } from '@/app/(dashboard)/instrument/context/InstrumentContext';
import Status from './Status';
import ActionButtons from './ActionButtons';
import InstrumentModal from './InstrumentModal';

export default function InstrumentTable({ permissions }) {

    const {
        instruments,
        loading,
        error,
        total,
        fetchInstruments,
        addInstrument,
        updateInstrument,
    } = useInstruments();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingInstrument, setEditingInstrument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // 分页状态
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // 当页码或每页条数变化时，重新请求数据
    useEffect(() => {
        fetchInstruments(page, pageSize);
    }, [page, pageSize, fetchInstruments]);

    const isAdmin = permissions.includes('edit_info');
    const canCreate = permissions.includes('create_asset');

    // 本地过滤（基于当前页数据，因后端无搜索参数）
    const filteredInstruments = useMemo(() => {
        if (!searchTerm) return instruments;
        return instruments.filter(inst =>
            inst.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [instruments, searchTerm]);

    const handleAdd = () => {
        setEditingInstrument(null);
        setModalOpen(true);
    };

    const handleEdit = (instrument) => {
        setEditingInstrument(instrument);
        setModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingInstrument) {
                await updateInstrument(editingInstrument.id, formData);
                await fetchInstruments(page, pageSize); // 编辑后需刷新当前页
            } else {
                await addInstrument(formData);
                await fetchInstruments(1, pageSize);
                setPage(1);
            }
            setModalOpen(false);
        } catch (err) {
            console.error('提交失败', err);
            alert(err.message);
        }
    };

    // 分页控制
    const totalPages = Math.ceil(total / pageSize);
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <div className="p-4">加载中...</div>;
    if (error) return <div className="p-4 text-red-500">错误: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">设备管理</h1>

            {/* 操作栏 */}
            <div className="flex items-center space-x-3 mb-6 flex-wrap gap-2">
                {canCreate && (
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        新增仪器
                    </button>
                )}
                <input
                    type="text"
                    placeholder="搜索设备（仅当前页）..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">筛选</button>
            </div>

            {/* 卡片列表 */}
            <div className="grid grid-cols-1 gap-4">
                {filteredInstruments.map((inst) => (
                    <div
                        key={inst.id}
                        className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold text-blue-600">{inst.name}</h2>
                            <Status status={inst.status} className="text-base px-5 py-2" />
                        </div>

                        <div className="space-y-1 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">型号：</span>
                                {inst.model || '未知'}
                            </p>
                            <p>
                                <span className="font-medium">厂商：</span>
                                {inst.manufacturer || '未知'}
                            </p>

                            {/* 管理员可见字段 */}
                            {isAdmin && (
                                <>
                                    <p>
                                        <span className="font-medium">供应商：</span>
                                        {inst.supplier || '未填写'}
                                    </p>
                                    <p>
                                        <span className="font-medium">购买日期：</span>
                                        {inst.purchase_date || '未填写'}
                                    </p>
                                    <p>
                                        <span className="font-medium">价格：</span>
                                        {inst.price ? `¥${inst.price}` : '未填写'}
                                    </p>
                                    <p>
                                        <span className="font-medium">实验室ID：</span>
                                        {inst.lab_id || '未填写'}
                                    </p>
                                    <p>
                                        <span className="font-medium">备注：</span>
                                        {inst.remark || '无'}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-300/70 my-6"></div>

                        <div className="mt-3 flex justify-end">
                            <ActionButtons 
                                instrument={inst} 
                                permissions={permissions} 
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 0 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        上一页
                    </button>
                    <span className="text-sm">
                        第 {page} / {totalPages} 页
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        下一页
                    </button>
                    <span className="text-sm text-gray-500">共 {total} 条</span>
                </div>
            )}

            {/* 模态框 */}
            <InstrumentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingInstrument}
                variant={editingInstrument ? 'quick' : 'full'}
            />

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">确认删除</h3>
                        <p className="mb-6">
                            确定要删除设备"{deleteConfirm.name}"吗？此操作无法撤销。
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}