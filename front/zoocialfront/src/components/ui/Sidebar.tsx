import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Home, Heart, ShoppingBag, MessageCircle, Settings, Menu, X, ClipboardList, PawPrint, LogOut, Stethoscope, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getFullImageUrl } from '../../utils/imageUrl';

// ROLE_BADGE_CONFIG - Color del badge por tipo de usuario
const ROLE_BADGE: Record<string, { bg: string; color: string; label: string }> = {
    admin:       { bg: '#dc2626', color: '#fff', label: 'Admin' },
    veterinario: { bg: '#16a34a', color: '#fff', label: 'Veterinario' },
    rescatista:  { bg: '#ea580c', color: '#fff', label: 'Rescatista' },
    normal:      { bg: '#0056B8', color: '#fff', label: 'Usuario' },
};

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const isVet = user?.rol === 'veterinario';
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const roleBadge = ROLE_BADGE[user?.rol ?? 'normal'] ?? ROLE_BADGE.normal;

    // SIDEBAR_AVATAR_IMG - Resolver URL completa del avatar para AlwaysData
    const avatarUrl = user?.imagen_perfil ? getFullImageUrl(user.imagen_perfil) : undefined;

    // Cerrar sidebar al cambiar de ruta (móvil)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Bloquear scroll del body cuando el sidebar está abierto en móvil
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
            {/* HAMBURGER_BTN - display controlado por CSS (.hamburger-btn), NO hardcoded */}
            <button
                id="sidebar-hamburger"
                onClick={() => setIsOpen(true)}
                className="hamburger-btn"
                aria-label="Abrir menú"
            >
                <Menu size={20} />
            </button>

            {/* Overlay oscuro (móvil) */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{ display: 'block' }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                {/* Logo + botón cerrar */}
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
                            display: 'none',
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

                {/* Navegación principal */}
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
                            <NavLink to="/vet-view" className={menuItemClass}>
                                <Stethoscope size={18} /> Vista Veterinario
                            </NavLink>
                        </>
                    ) : isVet ? (
                        /* VET_MENU - Menú especializado para veterinarios */
                        <>
                            <NavLink to="/feed" className={menuItemClass}>
                                <Home size={18} /> Inicio
                            </NavLink>
                            <NavLink to="/vet-view" className={menuItemClass}>
                                <Stethoscope size={18} /> Panel Veterinario
                            </NavLink>
                            <NavLink to="/adoptions" className={menuItemClass}>
                                <ClipboardList size={18} /> Adopciones
                            </NavLink>
                            <NavLink to="/adoptions" className={menuItemClass}>
                                <MapPin size={18} /> Veterinarias Cercanas
                            </NavLink>
                        </>
                    ) : (
                        /* USER_MENU - Menú para usuarios normales y rescatistas */
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

                {/* Footer del usuario */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        {/* SIDEBAR_AVATAR_IMG - Foto real si existe, sino inicial con color */}
                        <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user?.nombre_completo || 'Avatar'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    onError={(e) => {
                                        // AVATAR_FALLBACK - Imagen rota → ocultar y mostrar fondo de CSS
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                user?.nombre_completo?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontWeight: 600, fontSize: '0.85rem',
                                color: 'var(--color-dark)', textTransform: 'capitalize',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {user?.nombre_completo || 'Usuario'}
                            </div>
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{
                                    display: 'inline-block', padding: '0.1rem 0.5rem',
                                    borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                                    letterSpacing: '0.04em', textTransform: 'capitalize',
                                    backgroundColor: roleBadge.bg, color: roleBadge.color,
                                }}>
                                    {roleBadge.label}
                                </span>
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
