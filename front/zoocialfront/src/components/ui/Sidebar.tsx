import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    MessageCircle,
    Settings,
    LogOut,
    AlertCircle,
    Home,
    Heart,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.rol === 'admin';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/zoocialLogo.png" alt="Zoocial" style={{ height: '32px' }} />
                {isAdmin && <span style={{ color: '#64748b', fontWeight: 600, marginLeft: '4px', fontSize: '1rem' }}>Admin</span>}
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', marginTop: '1rem', paddingLeft: '0.5rem' }}>MENU</div>
            <nav className="sidebar-menu" style={{ flex: 1 }}>
                {isAdmin ? (
                    <>
                        <NavLink to="/dashboard" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={18} /> Resumen General
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <Users size={18} /> Gestionar Usuarios
                        </NavLink>
                        <NavLink to="/posts" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <FileText size={18} /> Mascotas y Posts
                        </NavLink>
                        <NavLink to="/support" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <AlertCircle size={18} /> Procesos de Adopción
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/feed" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <Home size={18} /> Inicio
                        </NavLink>
                        <NavLink to="/adoptions" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <Heart size={18} /> Adoptar
                        </NavLink>
                        <NavLink to="/store" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <ShoppingBag size={18} /> Tienda
                        </NavLink>
                    </>
                )}

                <div style={{ marginTop: 'auto' }}>
                    <NavLink to="/chat" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`} style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <MessageCircle size={18} /> Live Chat
                        </div>
                        <span className="badge">2</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }: { isActive: boolean }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                        <Settings size={18} /> Mi Perfil
                    </NavLink>
                </div>
            </nav>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontWeight: 'bold' }}>
                        {user?.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-dark)', textTransform: 'capitalize' }}>
                            {user?.nombre_completo || 'Usuario'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>
                            {user?.rol || 'Normal'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="btn"
                    style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1.25rem', backgroundColor: '#000', color: '#fff', borderRadius: '30px' }}
                >
                    Sign out <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};
