/*仪器列表卡片（根据权限动态列）*/

'use client';

import { useState ,useMemo} from 'react';
import { useInstruments } from '@/app/(dashboard)/instrument/context/InstrumentContext';
import Status from './Status';
import ActionButtons from './ActionButtons';
import InstrumentModal from './InstrumentModal';

export default function InstrumentCardList({ instruments, permissions }) {
    const { addInstrument, updateInstrument, deleteInstrument } = useInstruments();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingInstrument, setEditingInstrument] = useState(null); // null 表示新增
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const isAdmin = permissions.includes('edit_info');
    const canCreate = permissions.includes('create_asset');

    // 过滤逻辑（简单的名称搜索）
    const filteredInstruments = useMemo(() => instruments.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [instruments, searchTerm]);

    // 打开新增模态框
    const handleAdd = () => {
        setEditingInstrument(null);
        setModalOpen(true);
    };

    // 打开编辑模态框
    const handleEdit = (instrument) => {
        setEditingInstrument(instrument);
        setModalOpen(true);
    };

    const handleDelete = (instrument) => {
        setDeleteConfirm(instrument);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteInstrument(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    // 提交表单（新增或编辑）
    const handleSubmit = (formData) => {
        if (editingInstrument) {
            updateInstrument(editingInstrument.id, formData);
        } else {
            addInstrument(formData);
        }
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">设备管理</h1>

            {/* 操作栏行（按钮 + 搜索框） */}
            <div className="flex items-center space-x-3 mb-6">
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
                    placeholder="搜索设备..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">筛选</button>
                {permissions.includes('reserve') && (
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                        预约
                    </button>
                )}
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
                                <span className="font-medium">位置：</span>
                                {inst.location}
                            </p>

                            {/* 管理员可见字段 */}
                            {isAdmin && (
                                <>
                                    <p>
                                        <span className="font-medium">购买日期：</span>
                                        {inst.purchaseDate || '未填写'}
                                    </p>
                                    <p>
                                        <span className="font-medium">供应商：</span>
                                        {inst.supplier || '未填写'}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* 半透明分割线 */}
                        <div className="border-t border-gray-300/70 my-6"></div>

                        {/* 操作按钮 */}
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

            {/* 新增/编辑模态框 */}
            <InstrumentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingInstrument}
                variant={editingInstrument ? 'quick' : 'full'} // 列表页编辑使用快速表单，新增使用完整表单
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