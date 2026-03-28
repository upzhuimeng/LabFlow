//仪器列表页
'use client';

import InstrumentTable from '@/components/InstrumentTable';

const MOCK_PERMISSIONS = ['view_list', 'create_asset', 'edit_info', 'apply_transfer'];

export default function InstrumentsPage() {

    return (
        <div className="container mx-auto p-6">
            <InstrumentTable permissions={MOCK_PERMISSIONS} />
        </div>
    );
}