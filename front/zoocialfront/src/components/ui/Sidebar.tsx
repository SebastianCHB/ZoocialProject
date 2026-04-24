import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Home, Heart, ShoppingBag, MessageCircle, Settings, Menu, X, ClipboardList, PawPrint, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const menuItemClass = ({ isActive }: { isActive: boolean }) =>
        `sidebar-item ${isActive ? 'active' : ''}`;

    return (
        <>
            {/* Mobile hamburger button - rendered inside TopNav via CSS */}
            <button
                id="sidebar-hamburger"
                onClick={() => setIsOpen(true)}
                className="hamburger-btn"
                aria-label="Abrir menú"
                style={{ display: 'none' }} // controlled by CSS media query
            >
                <Menu size={20} />
            </button>

            {/* Overlay (mobile) */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{ display: 'block' }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                {/* Logo + Close button */}
                <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/zoocialLogo.png" alt="Zoocial" style={{ height: '30px' }} />
                        {isAdmin && (
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                backgroundColor: '#dc2626', padding: '0.15rem 0.5rem',
                                borderRadius: '6px', letterSpacing: '0.05em'
                            }}>ADMIN</span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            display: 'none', // shown via JS/media query
                            width: '28px', height: '28px', borderRadius: '8px',
                            backgroundColor: '#f1f5f9', color: '#64748b',
                            alignItems: 'center', justifyContent: 'center'
                        }}
                        className="sidebar-close-btn"
                        aria-label="Cerrar menú"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="sidebar-section-label">MENÚ</div>
                <nav className="sidebar-menu">
                    {isAdmin ? (
                        <>
                            <NavLink to="/dashboard" className={menuItemClass}>
                                <LayoutDashboard size={18} /> Resumen General
                            </NavLink>
                            <NavLink to="/feed" className={menuItemClass}>
                                <Home size={18} /> Feed Social
                            </NavLink>
                            <NavLink to="/users" className={menuItemClass}>
                                <Users size={18} /> Gestionar Usuarios
                            </NavLink>
                            <NavLink to="/posts" className={menuItemClass}>
                                <PawPrint size={18} /> Mascotas y Posts
                            </NavLink>
                            <NavLink to="/adoptions-admin" className={menuItemClass}>
                                <ClipboardList size={18} /> Procesos de Adopción
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/feed" className={menuItemClass}>
                                <Home size={18} /> Inicio
                            </NavLink>
                            <NavLink to="/adoptions" className={menuItemClass}>
                                <Heart size={18} /> Adoptar
                            </NavLink>
                            <NavLink to="/store" className={menuItemClass}>
                                <ShoppingBag size={18} /> Tienda
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>CUENTA</div>
                <nav className="sidebar-menu">
                    <NavLink
                        to="/chat"
                        className={menuItemClass}
                        style={{ justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <MessageCircle size={18} /> Mensajes
                        </div>
                    </NavLink>
                    <NavLink to="/profile" className={menuItemClass}>
                        <Settings size={18} /> Mi Perfil
                    </NavLink>
                </nav>

                {/* User footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {user?.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontWeight: 600, fontSize: '0.85rem',
                                color: 'var(--color-dark)', textTransform: 'capitalize',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {user?.nombre_completo || 'Usuario'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                {user?.rol || 'Normal'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-secondary btn-full"
                        style={{ justifyContent: 'space-between', padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                    >
                        Cerrar sesión <LogOut size={15} />
                    </button>
                </div>
            </aside>
        </>
    );
};
