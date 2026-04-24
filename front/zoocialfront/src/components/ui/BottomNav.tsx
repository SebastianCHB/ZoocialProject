import { NavLink, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, MessageCircle, User, LayoutDashboard, Users, PawPrint, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_STYLE: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e8e8e8',
    display: 'flex',
    alignItems: 'stretch',
    zIndex: 900,
    boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
};

const INNER_STYLE: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    alignItems: 'stretch',
};

const itemStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    textDecoration: 'none',
    color: active ? '#f69622' : '#94a3b8',
    fontSize: '10px',
    fontWeight: active ? 700 : 500,
    fontFamily: 'Inter, sans-serif',
    transition: 'color 0.2s',
    padding: '4px 0',
    minWidth: 0,
});

export const BottomNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const adminLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Panel' },
        { to: '/feed', icon: <Home size={20} />, label: 'Feed' },
        { to: '/users', icon: <Users size={20} />, label: 'Usuarios' },
        { to: '/posts', icon: <PawPrint size={20} />, label: 'Mascotas' },
        { to: '/adoptions-admin', icon: <ClipboardList size={20} />, label: 'Adopt.' },
    ];

    const userLinks = [
        { to: '/feed', icon: <Home size={20} />, label: 'Inicio' },
        { to: '/adoptions', icon: <Heart size={20} />, label: 'Adoptar' },
        { to: '/store', icon: <ShoppingBag size={20} />, label: 'Tienda' },
        { to: '/chat', icon: <MessageCircle size={20} />, label: 'Chat' },
        { to: '/profile', icon: <User size={20} />, label: 'Perfil' },
    ];

    const links = user?.rol === 'admin' ? adminLinks : userLinks;

    // Only show on mobile → hidden via CSS on desktop
    return (
        <>
            <style>{`
                .bottom-nav-root { display: none; }
                @media (max-width: 767px) { .bottom-nav-root { display: flex; } }
            `}</style>
            <nav className="bottom-nav-root" style={NAV_STYLE}>
                <div style={INNER_STYLE}>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={itemStyle(isActive(link.to))}
                        >
                            {link.icon}
                            <span style={{ fontSize: '10px', lineHeight: 1 }}>{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};
