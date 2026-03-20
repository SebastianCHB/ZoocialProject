import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TopNav } from '../components/ui/TopNav';
import api from '../api/axios';

export const Onboarding = () => {
    const { user, login, token } = useAuth();
    const navigate = useNavigate();
    
    // Step 1: Profile Data
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.nombre_completo !== 'Nuevo Usuario' ? user?.nombre_completo || '' : '');
    const [rol, setRol] = useState(user?.rol || 'normal');
    const [edad, setEdad] = useState(user?.edad?.toString() || '');
    
    // Step 2: Documents
    const [idFile, setIdFile] = useState<File | null>(null);
    const [cedulaFile, setCedulaFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidationRequired = rol === 'rescatista' || rol === 'veterinario';

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (isValidationRequired && (!edad || parseInt(edad) < 18)) {
            setError('Debes ser mayor de 18 años para ser Rescatista o Veterinario.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/usuarios/${user?.id_usuario}`, {
                nombre_completo: name,
                rol: rol,
                edad: edad ? parseInt(edad) : null
            });
            
            // Update auth context with new user data
            if (token) {
                login(token, response.data);
            }

            if (isValidationRequired) {
                setStep(2); // Go to document upload
            } else {
                navigate('/feed'); // Normal users go straight to feed
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error guardando perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleDocsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!idFile) {
            setError('La identificación oficial es obligatoria.');
            return;
        }
        if (rol === 'veterinario' && !cedulaFile) {
            setError('La cédula profesional es obligatoria para veterinarios.');
            return;
        }

        setLoading(true);
        try {
            // Upload ID
            const idFormData = new FormData();
            idFormData.append('documento', idFile);
            idFormData.append('documento_tipo', 'identificacion');
            await api.post('/validations', idFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Upload Cedula if Veterinario
            if (rol === 'veterinario' && cedulaFile) {
                const cedulaFormData = new FormData();
                cedulaFormData.append('documento', cedulaFile);
                cedulaFormData.append('documento_tipo', 'cedula_profesional');
                await api.post('/validations', cedulaFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setStep(3); // Success step
            setTimeout(() => {
                navigate('/feed');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error subiendo documentos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <TopNav title="Configuración de Cuenta" userName={user?.nombre_completo !== 'Nuevo Usuario' ? user?.nombre_completo : ''} />
            
            <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
                        {step === 1 ? "Completa tu perfil" : step === 2 ? "Verifica tu identidad" : "¡Todo listo!"}
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        {step === 1 ? "Dinos un poco más sobre ti para personalizar tu experiencia en Zoocial." : 
                         step === 2 ? "Por tu seguridad y la de las mascotas, necesitamos verificar tus credenciales." :
                         "Tus documentos están en revisión. Mientras tanto, puedes explorar la plataforma."}
                    </p>
                </div>

                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}>
                    
                    {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                    {step === 1 && (
                        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Input 
                                label="Nombre Completo" 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                required
                            />
                            
                            <div className="input-group">
                                <label className="input-label">¿Cómo usarás Zoocial?</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                                    {[
                                        { id: 'normal', title: 'Usuario Normal', desc: 'Quiero adoptar o ver mascotas' },
                                        { id: 'rescatista', title: 'Rescatista', desc: 'Quiero dar en adopción' },
                                        { id: 'veterinario', title: 'Veterinario', desc: 'Ofrecer mis servicios médicos' }
                                    ].map(type => (
                                        <div 
                                            key={type.id}
                                            onClick={() => setRol(type.id as any)}
                                            style={{
                                                border: `2px solid ${rol === type.id ? 'var(--color-primary)' : '#e2e8f0'}`,
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                cursor: 'pointer',
                                                backgroundColor: rol === type.id ? 'rgba(251, 171, 40, 0.05)' : '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, color: 'var(--color-dark)', marginBottom: '0.25rem' }}>{type.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{type.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Input 
                                label="Edad" 
                                type="number"
                                value={edad}
                                onChange={(e) => setEdad(e.target.value)}
                                placeholder="18"
                                required
                            />

                            <div style={{ marginTop: '1rem' }}>
                                <Button type="submit" fullWidth disabled={loading}>
                                    {loading ? 'Guardando...' : 'Continuar'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleDocsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Identificación Oficial <span style={{color: 'red'}}>*</span></h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>INE, Pasaporte o Licencia vigente.</p>
                                
                                <div style={{ width: '100%', border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                            {idFile ? idFile.name : "Subir archivo (PDF, JPG, PNG)"}
                                        </span>
                                        <input 
                                            type="file" 
                                            accept=".jpg,.jpeg,.png,.pdf" 
                                            onChange={(e) => e.target.files && setIdFile(e.target.files[0])}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'white' }}>
                                            Seleccionar archivo
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {rol === 'veterinario' && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cédula Profesional <span style={{color: 'red'}}>*</span></h3>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>Requerido para cuentas veterinarias.</p>
                                    
                                    <div style={{ width: '100%', border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                {cedulaFile ? cedulaFile.name : "Subir archivo (PDF, JPG, PNG)"}
                                            </span>
                                            <input 
                                                type="file" 
                                                accept=".jpg,.jpeg,.png,.pdf" 
                                                onChange={(e) => e.target.files && setCedulaFile(e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'white' }}>
                                                Seleccionar archivo
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                                    Atrás
                                </Button>
                                <Button type="submit" style={{ flex: 1 }} disabled={loading || !idFile || (rol === 'veterinario' && !cedulaFile)}>
                                    {loading ? 'Enviando...' : 'Enviar para Revisión'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ 
                                width: '80px', height: '80px', borderRadius: '50%', 
                                backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', margin: '0 auto 1.5rem auto' 
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Documentos Enviados</h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                                Hemos recibido tu solicitud. Estarás siendo redirigido al inicio en unos segundos...
                            </p>
                            <Button onClick={() => navigate('/feed')}>Ir al Feed Ahora</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
