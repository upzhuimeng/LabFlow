
'use client';

import { InstrumentProvider } from './context/InstrumentContext';

export default function InstrumentLayout({ children }) {
    return (
        <InstrumentProvider>
            {children}
        </InstrumentProvider>
    );
}