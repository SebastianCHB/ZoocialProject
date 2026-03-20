import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface TopNavProps {
    title?: string;
    userName?: string;
    onCancel?: () => void;
    onPrimaryAction?: () => void;
    primaryActionLabel?: string;
}

export const TopNav = ({ 
    title = "Dashboard", 
    userName = "Guest",
    onCancel, 
    onPrimaryAction, 
    primaryActionLabel = 'Post' 
}: TopNavProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onCancel) onCancel();
        else navigate(-1);
    };

    return (
        <header className="top-nav">
            <div className="top-nav-title">
                <button 
                    onClick={handleBack} 
                    style={{ 
                        padding: '0.5rem', 
                        borderRadius: '50%', 
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-dark)'
                    }}
                >
                    <ChevronLeft size={18} />
                </button>
                {title}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {userName && (
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                    Hola, {userName.split(' ')[0]} {/* Display first name */}
                </span>
                )}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontWeight: 'bold', fontSize: '14px' }}>
                {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="secondary" onClick={handleBack}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onPrimaryAction}>
                    {primaryActionLabel}
                </Button>
            </div>
        </header>
    );
};
