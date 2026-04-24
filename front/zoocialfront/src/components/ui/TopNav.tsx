import { Menu } from 'lucide-react';

interface TopNavProps {
    title?: string;
    userName?: string;
    onPrimaryAction?: () => void;
    primaryActionLabel?: string;
    onMenuClick?: () => void;
}

export const TopNav = ({
    title = "Dashboard",
    userName = "Guest",
    onPrimaryAction,
    primaryActionLabel,
    onMenuClick
}: TopNavProps) => {
    const initials = userName?.trim().charAt(0).toUpperCase() || 'U';

    const handleMenuClick = () => {
        if (onMenuClick) {
            onMenuClick();
            return;
        }
        // Fallback: trigger the sidebar hamburger
        const btn = document.getElementById('sidebar-hamburger');
        if (btn) btn.click();
        else {
            // Toggle sidebar directly via class
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('mobile-open');
        }
    };

    return (
        <header className="top-nav">
            <div className="top-nav-title">
                {/* Hamburger - only visible in CSS on mobile */}
                <button
                    className="hamburger-btn"
                    onClick={handleMenuClick}
                    aria-label="Menú"
                    style={{ marginRight: '0.25rem' }}
                >
                    <Menu size={20} />
                </button>
                <span>{title}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {onPrimaryAction && primaryActionLabel && (
                    <button
                        onClick={onPrimaryAction}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                    >
                        {primaryActionLabel}
                    </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}
                        className="hide-on-mobile">
                        Hola, {userName.split(' ')[0]}
                    </span>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-dark)', fontWeight: 700, fontSize: '0.875rem',
                        flexShrink: 0
                    }}>
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};
