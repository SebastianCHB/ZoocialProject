import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export const ForgotPassword = () => {
    const [email, setEmail]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);
    const [error, setError]       = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/forgot-password', { correo_e: email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar el correo. Intenta de nuevo.');
        } finally { setLoading(false); }
    };

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
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>¡Correo enviado!</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Si <strong>{email}</strong> está registrado en Zoocial, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.
                        </p>
                        <Link to="/login" style={{ display: 'inline-block', marginTop: '1.5rem', backgroundColor: '#6366f1', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                            Volver al login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={22} color="white" />
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Recuperar contraseña</h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem', marginLeft: '56px' }}>
                            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Correo electrónico
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="input-field"
                                />
                            </div>
                            <button
                                id="btn-forgot-submit"
                                type="submit"
                                disabled={loading}
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, fontFamily: 'var(--font-family)' }}
                            >
                                {loading ? (
                                    <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Enviando...</>
                                ) : (
                                    <><Mail size={18} /> Enviar enlace de recuperación</>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
