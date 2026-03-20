import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { AuthCarousel } from '../components/ui/AuthCarousel';
import api from '../api/axios';

export const IdentityValidation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const documentType = user?.rol === 'veterinario' ? 'cedula_profesional' : 'identificacion';
    const documentName = user?.rol === 'veterinario' ? 'Cédula Profesional' : 'Identificación Oficial';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            setError('Por favor selecciona un archivo.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        const formData = new FormData();
        formData.append('documento', file);
        formData.append('documento_tipo', documentType);

        try {
            await api.post('/validations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Documento enviado correctamente. Está en revisión.');
            setTimeout(() => navigate('/feed'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error subiendo el documento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-sidebar">
                <AuthCarousel />
            </div>
            
            <div className="auth-form-container" style={{ position: 'relative', overflow: 'hidden' }}>
                <img src="/paw.svg" alt="" style={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.05, width: '120px', transform: 'rotate(15deg)' }} />
                <img src="/paw.svg" alt="" style={{ position: 'absolute', bottom: '10%', left: '5%', opacity: 0.05, width: '180px', transform: 'rotate(-25deg)' }} />
                
                <div className="auth-card" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                    <div className="brand-logo">
                        <img src="/ZoocialLogo.svg" alt="Zoocial Logo" style={{ marginBottom: '1rem' }} />
                    </div>

                    <div style={{
                        width: '80px', 
                        height: '60px', 
                        backgroundColor: 'var(--color-accent)', 
                        borderRadius: '8px',
                        margin: '0 auto 1.5rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <div style={{ width: '30px', height: '30px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '10px' }} />
                        <div style={{ width: '25px', height: '6px', backgroundColor: 'var(--color-primary)', position: 'absolute', right: '10px', top: '15px', borderRadius: '4px' }} />
                        <div style={{ width: '25px', height: '6px', backgroundColor: 'white', position: 'absolute', right: '10px', top: '28px', borderRadius: '4px' }} />
                        <div style={{ width: '15px', height: '6px', backgroundColor: 'white', position: 'absolute', right: '20px', top: '41px', borderRadius: '4px' }} />
                    </div>
                
                    <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
                        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Validación de Identidad</h1>
                        <p className="auth-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Necesitamos una <strong>{documentName}</strong> para confirmar tu rol de <strong>{user?.rol}</strong>.
                        </p>
                    </div>

                    {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
                    {message && <div style={{ color: '#047857', backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #10b981' }}>{message}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ width: '100%', border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {file ? file.name : "Carga tu foto o captura aquí"}
                                </span>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.pdf" 
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-dark)', backgroundColor: 'white' }}>
                                    Seleccionar archivo
                                </div>
                            </label>
                        </div>
                        
                        <div style={{ marginTop: '0.5rem' }}>
                            <Button type="submit" fullWidth disabled={loading || !file}>
                                {loading ? 'Enviando...' : 'Todo Listo'}
                            </Button>
                        </div>
                        
                        <div style={{ marginTop: '1rem' }}>
                            <button type="button" onClick={() => navigate('/login')} style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'underline' }}>
                                Cancelar y volver
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
