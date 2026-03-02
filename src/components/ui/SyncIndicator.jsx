import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud } from 'lucide-react';

const SyncIndicator = ({ sm = false }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div style={{
            padding: sm ? '0.2rem 0.6rem' : '0.4rem 0.8rem',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: sm ? '0.6rem' : '0.7rem',
            fontWeight: 800,
            transition: 'all 0.3s ease',
            background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isOnline ? '#22c55e' : '#ef4444',
            border: isOnline ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
            whiteSpace: 'nowrap'
        }}>
            {isOnline ? <Wifi size={sm ? 10 : 12} /> : <WifiOff size={sm ? 10 : 12} />}
            <span>{isOnline ? 'CONECTADO' : 'OFFLINE'}</span>
            {!sm && <Cloud size={10} style={{ opacity: 0.5 }} />}
        </div>
    );
};

export default SyncIndicator;
