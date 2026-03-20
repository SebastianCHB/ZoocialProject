import { useState, useEffect } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import api from '../api/axios';

export const PetsManager = () => {
    const { user } = useAuth();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [isAppFormOpen, setIsAppFormOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        especie: '',
        raza: '',
        edad_estimada: '',
        sexo: 'macho',
        tamaño: 'mediano',
        peso: '',
        historia: '',
        estado_adopcion: 'disponible'
    });

    const fetchPets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/animalito');
            setPets(res.data);
        } catch (err) {
            setError('Error al cargar mascotas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleOpenForm = (pet: any = null) => {
        if (pet) {
            setEditingPet(pet);
            setFormData({
                nombre: pet.nombre,
                especie: pet.especie || '',
                raza: pet.raza || '',
                edad_estimada: pet.edad_estimada?.toString() || '',
                sexo: pet.sexo,
                tamaño: pet.tamaño,
                peso: pet.peso?.toString() || '',
                historia: pet.historia || '',
                estado_adopcion: pet.estado_adopcion || 'disponible'
            });
        } else {
            setEditingPet(null);
            setFormData({
                nombre: '',
                especie: '',
                raza: '',
                edad_estimada: '',
                sexo: 'macho',
                tamaño: 'mediano',
                peso: '',
                historia: '',
                estado_adopcion: 'disponible'
            });
        }
        setIsAppFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsAppFormOpen(false);
        setEditingPet(null);
        setError('');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...formData,
                peso: parseFloat(formData.peso),
                edad_estimada: parseFloat(formData.edad_estimada),
                id_usuario_registrador: user?.id_usuario // Important: Assuming backend expects this
            };

            if (editingPet) {
                await api.put(`/animalito/${editingPet.id_animalito}`, payload);
            } else {
                await api.post('/animalito', payload);
            }
            handleCloseForm();
            fetchPets(); // Refresh list
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error guardando datos de la mascota.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Seguro que deseas eliminar esta mascota?")) {
            try {
                await api.delete(`/animalito/${id}`);
                setPets(pets.filter(p => p.id_animalito !== id));
            } catch (err) {
                alert('No se pudo eliminar: Posibles registros asociados existentes.');
                console.error(err);
            }
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ position: 'relative' }}>
                <TopNav title="Gestión de Mascotas" userName={user?.nombre_completo} primaryActionLabel="Nueva Mascota" onPrimaryAction={() => handleOpenForm(null)} />
                
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-dark)' }}>Inventario de Peluditos</h1>
                        <Button onClick={() => handleOpenForm(null)}>
                            <Plus size={16} /> Agregar Peludito
                        </Button>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando datos...</div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Nombre</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Sexo/Edad</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Estado</th>
                                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pets.map(pet => (
                                        <tr key={pet.id_animalito} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{pet.nombre}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tamaño: {pet.tamaño}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ textTransform: 'capitalize', color: 'var(--color-dark)' }}>{pet.sexo}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{pet.edad_estimada} años</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    backgroundColor: pet.estado_adopcion === 'adoptado' ? '#dcfce7' : '#fef9c3', 
                                                    color: pet.estado_adopcion === 'adoptado' ? '#16a34a' : '#ca8a04', 
                                                    padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' 
                                                }}>
                                                    {pet.estado_adopcion}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button onClick={() => handleOpenForm(pet)} style={{ padding: '0.5rem', color: '#3b82f6', borderRadius: 'var(--radius-sm)' }} title="Editar">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(pet.id_animalito)} style={{ padding: '0.5rem', color: '#ef4444', borderRadius: 'var(--radius-sm)' }} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pets.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                                                No hay registros de mascotas.
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
                        <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingPet ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
                                <button onClick={handleCloseForm} style={{ color: '#64748b' }}><X size={20} /></button>
                            </div>
                            
                            {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Nombre</label>
                                        <input type="text" className="input-field" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Estado de Adopción</label>
                                        <select className="input-field" value={formData.estado_adopcion} onChange={e => setFormData({...formData, estado_adopcion: e.target.value})}>
                                            <option value="disponible">Disponible</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="adoptado">Adoptado</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Especie (ID)</label>
                                        <input type="text" className="input-field" value={formData.especie} onChange={e => setFormData({...formData, especie: e.target.value})} placeholder="Ej. 1" />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Raza (ID)</label>
                                        <input type="text" className="input-field" value={formData.raza} onChange={e => setFormData({...formData, raza: e.target.value})} placeholder="Ej. 2" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Sexo</label>
                                        <select className="input-field" value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                                            <option value="macho">Macho</option>
                                            <option value="hembra">Hembra</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Edad Estimada</label>
                                        <input type="number" step="0.1" className="input-field" value={formData.edad_estimada} onChange={e => setFormData({...formData, edad_estimada: e.target.value})} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Peso (lbs)</label>
                                        <input type="number" step="0.1" className="input-field" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} required />
                                    </div>
                                </div>
                                
                                <div className="input-group">
                                    <label className="input-label">Tamaño</label>
                                    <select className="input-field" value={formData.tamaño} onChange={e => setFormData({...formData, tamaño: e.target.value})}>
                                        <option value="pequeño">Pequeño</option>
                                        <option value="mediano">Mediano</option>
                                        <option value="grande">Grande</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Historia</label>
                                    <textarea className="input-field" value={formData.historia} onChange={e => setFormData({...formData, historia: e.target.value})} rows={3} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancelar</Button>
                                    <Button type="submit">Guardar Registro</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
