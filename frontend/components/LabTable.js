'use client';

import { useState, useMemo } from 'react';
import Status from './Status';
import ActionButtons from './ActionButtons';
import LabModal from './LabModal';

export default function LabTable({ labs, permissions, onUpdateLab, onAddLab, onDeleteLab }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const isAdmin = permissions.includes('edit_info');
    const canCreate = permissions.includes('create_lab');
    const canDelete = permissions.includes('edit_info');

    const filteredLabs = useMemo(() => labs.filter(lab =>
        lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.address.toLowerCase().includes(searchTerm.toLowerCase())
    ), [labs, searchTerm]);

    const handleAdd = () => {
        setEditingLab(null);
        setModalOpen(true);
    };

    const handleEdit = (lab) => {
        setEditingLab(lab);
        setModalOpen(true);
    };

    const handleDelete = (lab) => {
        setDeleteConfirm(lab);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            onDeleteLab(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleSubmit = (formData) => {
        if (editingLab) {
            onUpdateLab(editingLab.id, formData);
        } else {
            onAddLab(formData);
        }
        setModalOpen(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingLab(null);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">实验室管理</h1>

            <div className="flex items-center space-x-3 mb-6">
                {canCreate && (
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        新增实验室
                    </button>
                )}
                <input
                    type="text"
                    placeholder="搜索实验室..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">筛选</button>
            </div>

            {filteredLabs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg">暂无实验室数据</p>
                    {canCreate && (
                        <button
                            onClick={handleAdd}
                            className="mt-4 text-blue-600 hover:text-blue-700"
                        >
                            点击添加第一个实验室
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredLabs.map((lab) => (
                        <div
                            key={lab.id}
                            className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold text-blue-600">{lab.name}</h2>
                                <Status status={lab.status} className="text-base px-5 py-2" />
                            </div>

                            <div className="space-y-1 text-sm text-gray-700">
                                <p>
                                    <span className="font-medium">实验室 ID：</span>
                                    {lab.id}
                                </p>
                                <p>
                                    <span className="font-medium">地址：</span>
                                    {lab.address}
                                </p>
                                <p>
                                    <span className="font-medium">可容纳人数：</span>
                                    {lab.capacity} 人
                                </p>

                                {isAdmin && (
                                    <>
                                        <p>
                                            <span className="font-medium">负责人：</span>
                                            {lab.manager || '未填写'}
                                        </p>
                                        <p>
                                            <span className="font-medium">联系电话：</span>
                                            {lab.phone || '未填写'}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-300/70 my-6"></div>

                            <div className="mt-3 flex justify-end">
                                <ActionButtons
                                    instrument={lab}
                                    permissions={permissions}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    type="lab"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LabModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingLab}
                variant={editingLab ? 'quick' : 'full'}
            />

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">确认删除</h3>
                        <p className="mb-6">
                            确定要删除实验室"{deleteConfirm.name}"吗？此操作无法撤销。
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
