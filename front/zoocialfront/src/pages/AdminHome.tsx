import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Home, PawPrint, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminHome = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'var(--font-family)'
        }}>
            {/* Logo */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <img src="/zoocialLogo.png" alt="Zoocial" style={{ height: '48px', margin: '0 auto 1rem' }} />
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: '#dc2626', color: '#fff',
                    padding: '0.3rem 1rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em'
                }}>
                    PANEL DE ADMINISTRACIÓN
                </div>
            </div>

            {/* Greeting */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                    Bienvenido, {user?.nombre_completo?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    ¿Qué quieres hacer hoy?
                </p>
            </div>

            {/* Mode selector cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                width: '100%',
                maxWidth: '640px',
                marginBottom: '3rem'
            }}>
                {/* Dashboard mode */}
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        borderRadius: '20px',
                        padding: '2rem 1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        color: '#fff',
                        backdropFilter: 'blur(8px)'
                    }}
                    onMouseOver={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseOut={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                    }}
                >
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'rgba(0,86,184,0.3)', border: '1px solid rgba(0,86,184,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <LayoutDashboard size={28} color="#60a5fa" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        Panel Admin
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Gestiona usuarios, mascotas y procesos de adopción
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { icon: <Users size={13} />, label: 'Usuarios' },
                            { icon: <PawPrint size={13} />, label: 'Mascotas' },
                            { icon: <ClipboardList size={13} />, label: 'Adopciones' },
                        ].map(item => (
                            <span key={item.label} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                padding: '0.2rem 0.6rem', borderRadius: '8px',
                                fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600
                            }}>
                                {item.icon} {item.label}
                            </span>
                        ))}
                    </div>
                </button>

                {/* Feed mode */}
                <button
                    onClick={() => navigate('/feed')}
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        borderRadius: '20px',
                        padding: '2rem 1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        color: '#fff',
                        backdropFilter: 'blur(8px)'
                    }}
                    onMouseOver={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseOut={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                    }}
                >
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'rgba(251,171,40,0.2)', border: '1px solid rgba(251,171,40,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <Home size={28} color="#fbbf24" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        Vista Usuario
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Navega el feed social como cualquier usuario de la plataforma
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { icon: <Home size={13} />, label: 'Feed' },
                            { icon: <ClipboardList size={13} />, label: 'Chat' },
                            { icon: <Users size={13} />, label: 'Perfil' },
                        ].map(item => (
                            <span key={item.label} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                padding: '0.2rem 0.6rem', borderRadius: '8px',
                                fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600
                            }}>
                                {item.icon} {item.label}
                            </span>
                        ))}
                    </div>
                </button>
            </div>

            {/* Logout */}
            <button
                onClick={logout}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: '#94a3b8', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                    padding: '0.5rem 1rem', borderRadius: '10px',
                    transition: 'color 0.2s',
                    fontFamily: 'var(--font-family)'
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
            >
                <LogOut size={18} /> Cerrar sesión
            </button>
        </div>
    );
};
