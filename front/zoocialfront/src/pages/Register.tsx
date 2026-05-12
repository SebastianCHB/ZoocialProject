import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthCarousel } from '../components/ui/AuthCarousel';
import api from '../api/axios';
import { User, Mail, Lock, Eye, EyeOff, Heart, Stethoscope, Users } from 'lucide-react';

// ROL_CONFIG - Configuración de los tipos de usuario disponibles en el registro
const ROL_OPTIONS = [
    {
        value: 'normal',
        label: 'Usuario Normal',
        desc: 'Adopta mascotas y participa en la comunidad',
        icon: <Users size={22} />,
        color: '#0056B8',
        bg: '#eff6ff',
    },
    {
        value: 'rescatista',
        label: 'Adoptante / Rescatista',
        desc: 'Rescata, cuida y da mascotas en adopción',
        icon: <Heart size={22} />,
        color: '#ea580c',
        bg: '#fff7ed',
    },
    {
        value: 'veterinario',
        label: 'Veterinario',
        desc: 'Asiste médicamente a las mascotas del refugio',
        icon: <Stethoscope size={22} />,
        color: '#16a34a',
        bg: '#f0fdf4',
    },
];

// REGISTER_PAGE - Registro con selección de tipo de usuario
export const Register = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRol, setSelectedRol] = useState<'normal' | 'rescatista' | 'veterinario'>('normal');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // REGISTER_ENDPOINT_FIX - Usar /register (ruta pública), NO /usuarios (requiere token)
            const response = await api.post('/register', {
                nombre_completo: fullName,
                correo_e: email,
                password,
                // ROL_FIELD - Enviamos el rol seleccionado por el usuario
                rol: selectedRol,
            });

            // AUTO_LOGIN - El backend retorna token tras registro, hacemos login automático
            if (response.data.access_token) {
                login(response.data.access_token, response.data.user);
                if (selectedRol === 'veterinario') {
                    navigate('/vet-view');
                } else {
                    navigate('/feed');
                }
            } else {
                navigate('/login');
            }

        } catch (err: any) {
            const errData = err.response?.data;
            setError(
                errData?.message ||
                errData?.errors?.correo_e?.[0] ||
                errData?.errors?.nombre_completo?.[0] ||
                'Error al registrar. El correo puede estar en uso.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-form-container">
                <div className="auth-card">
                    {/* AUTH_LOGO */}
                    <div className="brand-logo">
                        <img src="/zoocialLogo.png" alt="Zoocial" />
                    </div>

                    {step === 1 ? (
                        /* STEP_1 - Selección de tipo de usuario */
                        <>
                            <div className="auth-header">
                                <h1 className="auth-title">¡Únete a Zoocial!</h1>
                                <p className="auth-subtitle">
                                    ¿Cómo quieres participar en la comunidad?
                                </p>
                            </div>

                            {/* ROL_SELECTOR_CARDS - Cards interactivas para elegir rol */}
                            <div className="rol-selector-grid">
                                {ROL_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        id={`rol-${opt.value}`}
                                        className={`rol-card ${selectedRol === opt.value ? 'rol-card-active' : ''}`}
                                        style={{
                                            borderColor: selectedRol === opt.value ? opt.color : undefined,
                                            backgroundColor: selectedRol === opt.value ? opt.bg : undefined,
                                        }}
                                        onClick={() => setSelectedRol(opt.value as any)}
                                    >
                                        <div
                                            className="rol-card-icon"
                                            style={{
                                                color: opt.color,
                                                backgroundColor: selectedRol === opt.value ? opt.bg : '#f8fafc',
                                                border: `1.5px solid ${selectedRol === opt.value ? opt.color + '55' : '#e2e8f0'}`,
                                            }}
                                        >
                                            {opt.icon}
                                        </div>
                                        <div className="rol-card-label" style={{ color: selectedRol === opt.value ? opt.color : undefined }}>
                                            {opt.label}
                                        </div>
                                        <div className="rol-card-desc">{opt.desc}</div>
                                        {selectedRol === opt.value && (
                                            <div className="rol-card-check" style={{ backgroundColor: opt.color }}>✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button
                                id="register-next"
                                type="button"
                                fullWidth
                                onClick={() => setStep(2)}
                                style={{ marginTop: '0.5rem' }}
                            >
                                Continuar
                            </Button>

                            <p className="auth-footer-text" style={{ marginTop: '1.25rem' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="auth-link" style={{ fontWeight: 700 }}>
                                    Inicia sesión
                                </Link>
                            </p>
                        </>
                    ) : (
                        /* STEP_2 - Datos personales */
                        <>
                            <div className="auth-header">
                                <div className="rol-step2-badge" style={{
                                    backgroundColor: ROL_OPTIONS.find(r => r.value === selectedRol)?.bg,
                                    color: ROL_OPTIONS.find(r => r.value === selectedRol)?.color,
                                }}>
                                    {ROL_OPTIONS.find(r => r.value === selectedRol)?.icon}
                                    <span>{ROL_OPTIONS.find(r => r.value === selectedRol)?.label}</span>
                                </div>
                                <h1 className="auth-title" style={{ marginTop: '1rem' }}>Crea tu cuenta</h1>
                                <p className="auth-subtitle">Completa tus datos para comenzar</p>
                            </div>

                            {error && <div className="alert-error" role="alert">{error}</div>}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* NOMBRE_FIELD */}
                                <div className="auth-input-group">
                                    <span className="auth-input-icon"><User size={16} /></span>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </div>

                                {/* EMAIL_FIELD */}
                                <div className="auth-input-group">
                                    <span className="auth-input-icon"><Mail size={16} /></span>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </div>

                                {/* PASSWORD_FIELD */}
                                <div className="auth-input-group">
                                    <span className="auth-input-icon"><Lock size={16} /></span>
                                    <Input
                                        id="register-password"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Contraseña (mínimo 6 caracteres)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="auth-input"
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPass(p => !p)}
                                        aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        id="register-back"
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                        onClick={() => setStep(1)}
                                    >
                                        Atrás
                                    </button>
                                    <Button
                                        id="register-submit"
                                        type="submit"
                                        disabled={loading}
                                        style={{ flex: 2 }}
                                    >
                                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                                    </Button>
                                </div>
                            </form>

                            <p className="auth-footer-text" style={{ marginTop: '1.25rem' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="auth-link" style={{ fontWeight: 700 }}>
                                    Inicia sesión
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* CAROUSEL_SIDE - Solo desktop */}
            <div className="auth-sidebar desktop-only">
                <AuthCarousel />
            </div>
        </div>
    );
};
