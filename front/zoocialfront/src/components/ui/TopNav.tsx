import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFullImageUrl } from '../../utils/imageUrl';

interface TopNavProps {
    title?: string;
    userName?: string;
    onPrimaryAction?: () => void;
    primaryActionLabel?: string;
    onMenuClick?: () => void;
}

export const TopNav = ({
    title = "Dashboard",
    userName,
    onPrimaryAction,
    primaryActionLabel,
    onMenuClick
}: TopNavProps) => {
    // TOPNAV_AVATAR_IMG - Obtener foto de perfil directamente del contexto de auth
    const { user } = useAuth();
    const displayName = userName ?? user?.nombre_completo ?? 'Guest';
    const initials = displayName?.trim().charAt(0).toUpperCase() || 'U';
    // Resolver URL completa del avatar usando el helper que conoce la ruta de AlwaysData
    const avatarUrl = user?.imagen_perfil ? getFullImageUrl(user.imagen_perfil) : undefined;

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
        <>
            {/* MOBILE_ONLY_NAV - TopNav visible solo en móvil; en desktop el Sidebar lateral cumple esta función */}
            <style>{`
                .top-nav { display: none; }
                @media (max-width: 767px) { .top-nav { display: flex; } }
            `}</style>
            <header className="top-nav">
                <div className="top-nav-title">
                    {/* Hamburger - abre el Sidebar en móvil */}
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
                            Hola, {displayName.split(' ')[0]}
                        </span>
                        {/* TOPNAV_AVATAR_IMG - Foto real si existe, sino inicial con color */}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    objectFit: 'cover', border: '2px solid var(--color-primary)',
                                    flexShrink: 0
                                }}
                                onError={(e) => {
                                    // AVATAR_FALLBACK - Si la imagen falla, mostrar inicial
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-dark)', fontWeight: 700, fontSize: '0.875rem',
                                flexShrink: 0
                            }}>
                                {initials}
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};
