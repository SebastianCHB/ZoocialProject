import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthCarousel } from '../components/ui/AuthCarousel';
import api from '../api/axios';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/usuarios', {
                correo_e: email,
                password
            });

            // redirect to login
            navigate('/login');
            
        } catch (err: any) {
            setError(
                err.response?.data?.message || 
                'Registration failed. Email might be in use.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex' }}>
            
            <div className="auth-form-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: '#ffffff' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    
                    <div className="brand-logo" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <img src="../public/zoocialLogo.png" alt="Zoocial Logo" style={{ height: '60px', width: 'auto' }} />
                    </div>

                    <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 className="auth-title" style={{ fontSize: '2rem', fontWeight: 800, color: '#000' }}>Get started!</h1>
                        <p className="auth-subtitle" style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                            Join Zoocial to manage your pets and adoptions.<br/>Create an account for free.
                        </p>
                    </div>

                    {error && <div className="alert-error" style={{ backgroundColor: '#fff1f2', color: '#e11d48', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fda4af' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        <div style={{ position: 'relative' }}>
                            <Input 
                                type="email" 
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ borderRadius: '30px', padding: '1rem 1.5rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', width: '100%' }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Input 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ borderRadius: '30px', padding: '1rem 1.5rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', width: '100%' }}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <Button type="submit" fullWidth disabled={loading} style={{ borderRadius: '30px', padding: '1rem', backgroundColor: '#000', color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                                {loading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#94a3b8' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>or continue with</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button type="button" style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', 
                            border: '1px solid #e2e8f0', backgroundColor: '#fff', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <img src="/ggl.png" alt="Google" style={{ width: '24px', height: 'auto' }} />
                        </button>
                        <button type="button" style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', 
                            border: '1px solid #e2e8f0', backgroundColor: '#fff', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <img src="/fb.png" alt="Facebook" style={{ width: '24px', height: 'auto' }} />
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                        Already a member? <Link to="/login" style={{ color: '#000', fontWeight: 600 }}>Login now</Link>
                    </div>
                </div>
            </div>

            <div className="auth-sidebar" style={{ display: 'none' }}>
            </div>
            <style>{`
                @media (min-width: 1024px) {
                    .auth-sidebar.desktop-only {
                        display: flex !important;
                        flex: 1;
                        background-color: var(--color-surface);
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                    }
                }
            `}</style>
            <div className="auth-sidebar desktop-only">
                <AuthCarousel />
            </div>

        </div>
    );
};
