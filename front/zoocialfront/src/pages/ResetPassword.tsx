import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [token, setToken]           = useState('');
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [confirm, setConfirm]       = useState('');
    const [showPass, setShowPass]     = useState(false);
    const [loading, setLoading]       = useState(false);
    const [success, setSuccess]       = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        // READ_HASH_PARAMS - Leer parámetros del hash para compatibilidad con HashRouter
        const hash   = window.location.hash; // e.g. #/reset-password?token=XXX&email=YYY
        const search = hash.includes('?') ? hash.split('?')[1] : '';
        const params = new URLSearchParams(search);
        setToken(params.get('token') || '');
        setEmail(decodeURIComponent(params.get('email') || ''));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        if (password.length < 6)  { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        setLoading(true); setError('');
        try {
            await api.post('/reset-password', {
                token,
                correo_e:              email,
                password,
                password_confirmation: confirm,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Token inválido o expirado. Solicita uno nuevo.');
        } finally { setLoading(false); }
    };

    if (!token || !email) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>Enlace inválido. Por favor solicita un nuevo enlace de recuperación.</p>
                    <Link to="/forgot-password" style={{ color: '#6366f1', fontWeight: 700 }}>Solicitar nuevo enlace</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(99,102,241,0.12)' }}>

                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Volver al inicio de sesión
                </Link>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <CheckCircle size={36} color="#16a34a" />
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>¡Contraseña actualizada!</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Serás redirigido al login en unos segundos...</p>
                        <Link to="/login" style={{ display: 'inline-block', marginTop: '1.5rem', backgroundColor: '#6366f1', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                            Ir al login ahora
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={22} color="white" />
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Nueva contraseña</h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem', marginLeft: '56px' }}>
                            Crea una nueva contraseña para <strong>{email}</strong>
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nueva contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <input id="reset-password" type={showPass ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="input-field" style={{ paddingRight: '2.75rem' }} />
                                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirmar contraseña</label>
                                <input id="reset-confirm" type={showPass ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite tu contraseña" className="input-field" />
                            </div>
                            <button id="btn-reset-submit" type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, fontFamily: 'var(--font-family)' }}>
                                {loading ? (
                                    <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Actualizando...</>
                                ) : (
                                    <><Lock size={18} /> Actualizar contraseña</>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
