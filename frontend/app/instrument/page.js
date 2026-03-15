//仪器列表页

'use client';

import { useInstruments } from './context/InstrumentContext';
import InstrumentTable from './components/InstrumentTable';

const MOCK_PERMISSIONS = ['view_list', 'create_asset', 'edit_info', 'apply_transfer']; // 管理员

export default function InstrumentsPage() {
    const { instruments } = useInstruments(); // 从 Context 获取数据
    return (
        <div className="container mx-auto p-6">
            <InstrumentTable instruments={instruments} permissions={MOCK_PERMISSIONS} />
        </div>
    );
}