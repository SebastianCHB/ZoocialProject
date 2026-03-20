import { useState, useEffect } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Edit2, ShieldAlert, X } from 'lucide-react';
import api from '../api/axios';

export const UsersManager = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [isAppFormOpen, setIsAppFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre_completo: '',
        rol: 'normal',
        edad: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/usuarios');
            setUsers(res.data);
        } catch (err) {
            setError('Error al cargar la lista de usuarios.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenForm = (targetUser: any) => {
        setEditingUser(targetUser);
        setFormData({
            nombre_completo: targetUser.nombre_completo || '',
            rol: targetUser.rol || 'normal',
            edad: targetUser.edad?.toString() || ''
        });
        setIsAppFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsAppFormOpen(false);
        setEditingUser(null);
        setError('');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...formData,
                edad: formData.edad ? parseInt(formData.edad) : null
            };

            await api.put(`/usuarios/${editingUser.id_usuario}`, payload);
            handleCloseForm();
            fetchUsers(); // Refresh list
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error actualizando al usuario.');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ position: 'relative' }}>
                <TopNav title="Gestión de Usuarios" userName={user?.nombre_completo} />
                
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-dark)' }}>Usuarios del Sistema</h1>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando datos...</div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Usuario</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Correo</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Rol</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id_usuario} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        {u.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--color-dark)', textTransform: 'capitalize' }}>{u.nombre_completo || 'Sin nombre'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Edad: {u.edad || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                {u.correo_e}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    backgroundColor: u.rol === 'admin' ? '#fee2e2' : u.rol === 'veterinario' ? '#e0e7ff' : '#f1f5f9', 
                                                    color: u.rol === 'admin' ? '#dc2626' : u.rol === 'veterinario' ? '#4f46e5' : '#475569', 
                                                    padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' 
                                                }}>
                                                    {u.rol}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button onClick={() => handleOpenForm(u)} style={{ padding: '0.5rem', color: '#3b82f6', borderRadius: 'var(--radius-sm)' }} title="Modificar">
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                                                No hay usuarios registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Form */}
                {isAppFormOpen && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4rem', zIndex: 100 }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldAlert size={20} color="var(--color-primary)" />
                                    Modificar Usuario
                                </h2>
                                <button onClick={handleCloseForm} style={{ color: '#64748b' }}><X size={20} /></button>
                            </div>
                            
                            {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Nombre Completo</label>
                                    <input type="text" className="input-field" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Rol del Sistema</label>
                                        <select className="input-field" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                                            <option value="normal">Normal</option>
                                            <option value="rescatista">Rescatista</option>
                                            <option value="veterinario">Veterinario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Edad</label>
                                        <input type="number" className="input-field" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} placeholder="Opcional" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancelar</Button>
                                    <Button type="submit">Aplicar Cambios</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
