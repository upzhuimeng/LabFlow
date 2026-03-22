
export default function DashboardCard({ title, items }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}