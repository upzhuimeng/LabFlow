/*状态标签：根据数字状态显示对应颜色和文本*/
export default function Status({ status, className = '' }) {
    const statusMap = {
        0: { text: '正常', color: 'bg-green-100 text-green-800' },
        1: { text: '维修', color: 'bg-red-100 text-red-800' },
        2: { text: '停用', color: 'bg-gray-100 text-gray-800' },
    };
    const { text, color } = statusMap[status] || statusMap[0];
    return (
        <span className={`px-2 py-1 rounded-full text-base font-medium ${color} ${className}`}>
            {text}
        </span>
    );
}