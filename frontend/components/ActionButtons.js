/*行内操作按钮{编辑（修改状态）、高级筛选（显示详情）}*/

import Link from 'next/link';

export default function ActionButtons({ instrument, permissions, onEdit }) {
    const canEdit = permissions.includes('edit_info');

    const handleEditClick = () => {
        onEdit(instrument); // 触发父组件的编辑回调
    };

    return (
        <div className="flex gap-2 justify-end whitespace-nowrap flex-nowrap">
            <Link
                href={`/instrument/${instrument.id}`}
                className="flex items-center border border-gray-300 bg-white hover:bg-gray-300 text-gray-600 py-2 px-3 rounded transition-colors"
            >
                详情
            </Link>

            {canEdit && (
                <button
                    onClick={handleEditClick}
                    className="flex items-center border border-gray-300 bg-white hover:bg-gray-300 text-gray-600 py-2 px-3 rounded transition-colors"
                >
                    编辑
                </button>
            )}
        </div>
    );
}