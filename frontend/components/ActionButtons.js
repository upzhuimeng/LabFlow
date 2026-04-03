import Link from 'next/link';

export default function ActionButtons({ instrument, permissions, onEdit, onDelete, type = 'instrument' }) {
    const canEdit = permissions.includes('edit_info');
    const canDelete = permissions.includes('edit_info') && onDelete;

    const handleEditClick = () => {
        onEdit(instrument);
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(instrument);
        }
    };

    return (
        <div className="flex gap-2 justify-end whitespace-nowrap flex-nowrap">
            <Link
                href={`/${type}/${instrument.id}`}
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

            {canDelete && (
                <button
                    onClick={handleDeleteClick}
                    className="flex items-center border border-red-300 bg-white hover:bg-red-50 text-red-600 py-2 px-3 rounded transition-colors"
                >
                    删除
                </button>
            )}
        </div>
    );
}