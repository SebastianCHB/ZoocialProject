import { useState, useEffect } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, X, Search, Shield, UserCheck } from 'lucide-react';
import api from '../api/axios';

const ROLES = ['normal', 'rescatista', 'veterinario', 'admin'];

const roleBadgeStyle = (rol: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        admin: { bg: '#fee2e2', color: '#dc2626' },
        veterinario: { bg: '#e0e7ff', color: '#4f46e5' },
        rescatista: { bg: '#fff7ed', color: '#ea580c' },
        normal: { bg: '#f1f5f9', color: '#475569' },
    };
    return map[rol] ?? map.normal;
};

export const UsersManager = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    // Edit modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [formData, setFormData] = useState({ nombre_completo: '', rol: 'normal', edad: '' });

    // Delete confirm modal
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/usuarios');
            setUsers(res.data);
            setFiltered(res.data);
        } catch {
            setError('Error al cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Search filter
    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            users.filter(u =>
                u.nombre_completo?.toLowerCase().includes(q) ||
                u.correo_e?.toLowerCase().includes(q) ||
                u.rol?.toLowerCase().includes(q)
            )
        );
    }, [search, users]);

    const openEdit = (u: any) => {
        setEditingUser(u);
        setFormData({ nombre_completo: u.nombre_completo || '', rol: u.rol || 'normal', edad: u.edad?.toString() || '' });
        setError('');
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/usuarios/${editingUser.id_usuario}`, {
                ...formData,
                edad: formData.edad ? parseInt(formData.edad) : null
            });
            setIsEditOpen(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error actualizando al usuario.');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/usuarios/${deleteTarget.id_usuario}`);
            setDeleteTarget(null);
            fetchUsers();
        } catch {
            setError('No se pudo eliminar el usuario.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Gestión de Usuarios" userName={user?.nombre_completo} />

                <div style={{ padding: '1.5rem 2rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
                                Usuarios del Sistema
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {users.length} usuarios registrados
                            </p>
                        </div>
                        {/* Search */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', border: '1.5px solid var(--color-border)', borderRadius: '12px', padding: '0.6rem 1rem', minWidth: '260px' }}>
                            <Search size={16} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o rol..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: 'var(--color-dark)', width: '100%', fontFamily: 'var(--font-family)' }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto', width: '36px', height: '36px', borderWidth: '4px' }} />
                        </div>
                    ) : (
                        <div className="table-container" style={{ backgroundColor: 'white' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Edad</th>
                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => {
                                        const rb = roleBadgeStyle(u.rol);
                                        const isSelf = u.id_usuario === user?.id_usuario;
                                        return (
                                            <tr key={u.id_usuario}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                                                            {u.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: 'var(--color-dark)', fontSize: '0.9rem' }}>
                                                                {u.nombre_completo || 'Sin nombre'}
                                                                {isSelf && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: '#64748b' }}>(Tú)</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{u.correo_e}</td>
                                                <td>
                                                    <span style={{ backgroundColor: rb.bg, color: rb.color, padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                                        {u.rol}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{u.edad || '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                                        <button
                                                            onClick={() => openEdit(u)}
                                                            title="Editar"
                                                            style={{ padding: '0.4rem', color: '#3b82f6', borderRadius: '8px', background: '#eff6ff', cursor: 'pointer', border: 'none', display: 'flex' }}
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(u)}
                                                            disabled={isSelf}
                                                            title={isSelf ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                                                            style={{ padding: '0.4rem', color: isSelf ? '#cbd5e1' : '#ef4444', borderRadius: '8px', background: isSelf ? '#f8fafc' : '#fef2f2', cursor: isSelf ? 'default' : 'pointer', border: 'none', display: 'flex', opacity: isSelf ? 0.5 : 1 }}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                                                {search ? 'Sin resultados para la búsqueda.' : 'No hay usuarios registrados.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditOpen && (
                    <div className="modal-backdrop" onClick={() => setIsEditOpen(false)}>
                        <div className="modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={18} color="var(--color-accent)" />
                                    Modificar Usuario
                                </h2>
                                <button onClick={() => setIsEditOpen(false)} style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {error && <div className="alert-error">{error}</div>}
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.875rem', color: '#64748b' }}>
                                <UserCheck size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                                Editando: <strong>{editingUser?.correo_e}</strong>
                            </div>
                            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Nombre Completo</label>
                                    <input type="text" className="input-field" value={formData.nombre_completo} onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Rol del Sistema</label>
                                        <select className="input-field" value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                                            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Edad</label>
                                        <input type="number" className="input-field" value={formData.edad} onChange={e => setFormData({ ...formData, edad: e.target.value })} placeholder="Opcional" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirm Modal */}
                {deleteTarget && (
                    <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
                        <div className="modal-box" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Trash2 size={24} color="#ef4444" />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
                                    ¿Eliminar usuario?
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Se eliminará permanentemente a <strong>{deleteTarget.nombre_completo}</strong>. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button className="btn btn-secondary btn-full" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                                <button
                                    className="btn btn-full"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    style={{ backgroundColor: '#ef4444', color: 'white', opacity: deleting ? 0.6 : 1 }}
                                >
                                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
