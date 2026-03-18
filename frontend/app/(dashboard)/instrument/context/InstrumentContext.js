
'use client';
import { createContext, useState, useContext } from 'react';

const InstrumentContext = createContext();

// 初始模拟数据（补全所有字段）
const INITIAL_INSTRUMENTS = [
    {
        id: 1,
        name: '高效液相色谱仪',
        location: 'A101',
        status: '可用',
        purchaseDate: '2020-01-01',
        supplier: '某公司',
        model: 'LC-20A',
        serialNumber: 'SN001',
        maintenanceCycle: '每月',
    },
    {
        id: 2,
        name: '离心机',
        location: 'B202',
        status: '使用中',
        purchaseDate: '2019-05-01',
        supplier: '某科技',
        model: 'Centri-8',
        serialNumber: 'SN002',
        maintenanceCycle: '每季度',
    },
    {
        id: 3,
        name: 'PCR仪',
        location: 'C303',
        status: '故障',
        purchaseDate: '2021-10-01',
        supplier: '某公司',
        model: 'PCR-96',
        serialNumber: 'SN003',
        maintenanceCycle: '每年',
    },
];

export function InstrumentProvider({ children }) {
    const [instruments, setInstruments] = useState(INITIAL_INSTRUMENTS);

    const addInstrument = (newInstrument) => {
        const id = Math.max(...instruments.map(i => i.id), 0) + 1;
        setInstruments([...instruments, { ...newInstrument, id }]);
    };

    const updateInstrument = (id, updatedData) => {
        setInstruments(instruments.map(inst => inst.id === id ? { ...inst, ...updatedData } : inst));
    };

    return (
        <InstrumentContext.Provider value={{ instruments, addInstrument, updateInstrument }}>
            {children}
        </InstrumentContext.Provider>
    );
}

export function useInstruments() {
    return useContext(InstrumentContext);
}