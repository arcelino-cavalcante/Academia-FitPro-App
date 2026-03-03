import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type} animate-slide-up`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <XCircle size={20} />}
                            {toast.type === 'warning' && <AlertTriangle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style jsx="true">{`
                .toast-container {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    pointer-events: none;
                }
                .toast {
                    pointer-events: auto;
                    min-width: 300px;
                    max-width: 450px;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    background: rgba(21, 24, 30, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    box-shadow: 0 10px 25px var(--border-color);
                    color: #fff;
                }
                .toast-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .toast-success .toast-icon { color: var(--primary); }
                .toast-error .toast-icon { color: var(--error); }
                .toast-warning .toast-icon { color: #fbbf24; }
                .toast-info .toast-icon { color: var(--accent); }
                
                .toast-message {
                    flex: 1;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .toast-close {
                    opacity: 0.5;
                    transition: opacity 0.2s;
                    color: #fff;
                }
                .toast-close:hover {
                    opacity: 1;
                }
                
                @media (max-width: 768px) {
                    .toast-container {
                        top: auto;
                        bottom: 6rem;
                        left: 1rem;
                        right: 1rem;
                    }
                    .toast {
                        min-width: 0;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
