import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'confirm' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(8, 8, 8, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <style>
                    {`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}
                </style>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-dark)' }}>{title}</h3>
                    <p style={{ color: '#64748b', margin: 0, lineHeight: 1.5 }}>{message}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    {type === 'confirm' && (
                        <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                            {cancelText}
                        </button>
                    )}
                    <button 
                        onClick={type === 'confirm' ? handleConfirm : onClose} 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1.5rem', backgroundColor: type === 'confirm' ? '#ef4444' : 'var(--color-primary)' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
