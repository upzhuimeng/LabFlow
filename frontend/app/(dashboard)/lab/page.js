

'use client';
import { useState } from 'react';
import LabTable from '@/components/LabTable';

const MOCK_PERMISSIONS = ['view_list', 'create_lab', 'edit_info', 'edit_status'];

const INITIAL_LABS = [
    {
        id: 1,
        name: '生物实验室 A',
        address: 'A 楼 302',
        capacity: 20,
        status: '正常',
        manager: '张教授',
        phone: '010-12345678',
        description: '主要用于生物学实验教学',
    },
    {
        id: 2,
        name: '化学实验室 B',
        address: 'B 楼 210',
        capacity: 15,
        status: '维护',
        manager: '李研究员',
        phone: '010-87654321',
        description: '化学分析实验室',
    },
    {
        id: 3,
        name: '物理实验室 C',
        address: 'C 楼 401',
        capacity: 25,
        status: '正常',
        manager: '王博士',
        phone: '010-66668888',
        description: '物理基础实验室',
    },
];

export default function LabsPage() {
    const [labs, setLabs] = useState(INITIAL_LABS);

    const handleUpdateLab = (id, updatedData) => {
        setLabs(prevLabs =>
            prevLabs.map(lab =>
                lab.id === id ? { ...lab, ...updatedData } : lab
            )
        );
    };

    const handleAddLab = (newLabData) => {
        const newId = labs.length > 0 ? Math.max(...labs.map(l => l.id)) + 1 : 1;
        const newLab = {
            ...newLabData,
            id: newId,
        };
        setLabs(prevLabs => [...prevLabs, newLab]);
    };

    const handleDeleteLab = (id) => {
        setLabs(prevLabs => prevLabs.filter(lab => lab.id !== id));
    };

    return (
        <div className="container mx-auto p-6">
            <LabTable 
                labs={labs} 
                permissions={MOCK_PERMISSIONS}
                onUpdateLab={handleUpdateLab}
                onAddLab={handleAddLab}
                onDeleteLab={handleDeleteLab}
            />
        </div>
    );
}
