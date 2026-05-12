import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Lock, Mail, Eye, EyeOff, ArrowRight, PawPrint, Heart, Shield } from 'lucide-react';

export const Login = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/login', { correo_e: email, password });
            if (res.data.access_token) {
                login(res.data.access_token, res.data.user);
                const u = res.data.user;
                if (u.nombre_completo === 'Nuevo Usuario') navigate('/onboarding');
                else if (u.rol === 'admin')       navigate('/admin-home');
                else if (u.rol === 'veterinario') navigate('/vet-view');
                else                               navigate('/feed');
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.correo_e?.[0] ||
                'Credenciales incorrectas. Verifica tu correo y contraseña.'
            );
        } finally { setLoading(false); }
    };

    const features = [
        { icon: PawPrint, text: 'Adopta mascotas que necesitan un hogar' },
        { icon: Heart,    text: 'Dona y apoya a los refugios locales' },
        { icon: Shield,   text: 'Plataforma segura y verificada' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-family)' }}>

            {/* ── LEFT PANEL ── */}
            <div style={{
                flex: '0 0 480px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '3rem 3.5rem',
                background: '#ffffff', position: 'relative', zIndex: 1,
                boxShadow: '4px 0 40px rgba(0,0,0,0.06)',
            }}>
                {/* Logo */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                    <img src="/zoocialLogo.png" alt="Zoocial" style={{ height: '52px', width: 'auto' }} />
                </div>

                {/* Heading */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                        Bienvenido de vuelta
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                        Ingresa a tu cuenta para gestionar adopciones y conectar con nuestra comunidad.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                        borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.25rem',
                        fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1rem' }}>⚠️</span> {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Correo electrónico
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                                <Mail size={16} />
                            </span>
                            <input
                                id="login-email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                style={{
                                    width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                                    fontSize: '0.95rem', fontFamily: 'inherit', color: '#0f172a',
                                    background: '#f8fafc', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#FBAB28'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(251,171,40,0.15)'; }}
                                onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Contraseña
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#FBAB28', fontWeight: 600, textDecoration: 'none' }}
                                onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseOut={e  => (e.currentTarget.style.textDecoration = 'none')}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                                <Lock size={16} />
                            </span>
                            <input
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Tu contraseña"
                                style={{
                                    width: '100%', padding: '0.875rem 3rem 0.875rem 2.75rem',
                                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                                    fontSize: '0.95rem', fontFamily: 'inherit', color: '#0f172a',
                                    background: '#f8fafc', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#FBAB28'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(251,171,40,0.15)'; }}
                                onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '0.2rem' }}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.9375rem', marginTop: '0.5rem',
                            background: loading ? '#f59e0b' : 'linear-gradient(135deg, #FBAB28 0%, #f59e0b 100%)',
                            color: '#1a1a1a', border: 'none', borderRadius: '14px',
                            fontWeight: 800, fontSize: '1rem', fontFamily: 'inherit',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'all 0.2s', opacity: loading ? 0.8 : 1,
                            boxShadow: '0 4px 16px rgba(251,171,40,0.35)',
                        }}
                        onMouseOver={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(251,171,40,0.45)'; } }}
                        onMouseOut={e  => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(251,171,40,0.35)'; }}
                    >
                        {loading ? (
                            <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Autenticando...</>
                        ) : (
                            <>Iniciar Sesión <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#cbd5e1', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ padding: '0 1rem', color: '#94a3b8', fontWeight: 500 }}>o continúa con</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                {/* Social */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                        { id: 'login-google',   src: '/ggl.png',  label: 'Google' },
                        { id: 'login-facebook', src: '/fb.png',   label: 'Facebook' },
                    ].map(s => (
                        <button key={s.id} id={s.id} type="button" style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                            background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.875rem',
                            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                        }}
                            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                            onMouseOut={e  => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                        >
                            <img src={s.src} alt={s.label} style={{ width: '20px', display: 'block' }} />
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Register link */}
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                    ¿Aún no tienes cuenta?{' '}
                    <Link to="/register" style={{ color: '#FBAB28', fontWeight: 700, textDecoration: 'none' }}
                        onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseOut={e  => (e.currentTarget.style.textDecoration = 'none')}>
                        Regístrate gratis →
                    </Link>
                </p>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(145deg, #1a1f2e 0%, #0f172a 40%, #1e1b4b 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '3rem',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,171,40,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px',  width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px' }}>
                    {/* Big paw icon */}
                    <div style={{
                        width: '88px', height: '88px', borderRadius: '28px', margin: '0 auto 2rem',
                        background: 'linear-gradient(135deg, #FBAB28, #f59e0b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(251,171,40,0.3)',
                    }}>
                        <PawPrint size={44} color="#1a1a1a" strokeWidth={2.5} />
                    </div>

                    <h2 style={{ color: '#ffffff', fontSize: '2.25rem', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
                        Conecta.<br />
                        <span style={{ color: '#FBAB28' }}>Rescata.</span> Adopta.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 3rem' }}>
                        La plataforma de adopción animal más completa de México. Cada acción cuenta para cambiar una vida.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(251,171,40,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <f.icon size={20} color="#FBAB28" />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', justifyContent: 'center' }}>
                        {[
                            { n: '500+', l: 'Mascotas' },
                            { n: '1,200+', l: 'Usuarios' },
                            { n: '98%', l: 'Satisfacción' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ color: '#FBAB28', fontSize: '1.5rem', fontWeight: 800 }}>{s.n}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile: hide right panel */}
            <style>{`
                @media (max-width: 768px) {
                    #login-right-panel { display: none !important; }
                    #login-left-panel  { flex: 0 0 100% !important; padding: 2rem 1.5rem !important; }
                }
            `}</style>
        </div>
    );
};
