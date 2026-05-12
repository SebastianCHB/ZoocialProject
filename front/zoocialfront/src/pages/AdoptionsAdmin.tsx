import { useState, useEffect } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle, XCircle, Clock, RefreshCw, User, PawPrint } from 'lucide-react';
import api from '../api/axios';
import { getFullImageUrl } from '../utils/imageUrl';

// STATUS_CONFIG_ADOPCION - Colores e íconos para cada estado de solicitud
const STATUS_CONFIG = {
    pendiente: { label: 'Pendiente',  bg: '#fff7ed', color: '#ea580c', icon: <Clock size={14} /> },
    aprobado:  { label: 'Aprobado',   bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle size={14} /> },
    rechazado: { label: 'Rechazado',  bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={14} /> },
} as const;

// ADOPCIONES_ADMIN_PAGE - Panel admin para gestionar procesos de adopción
export const AdoptionsAdmin = () => {
    const { user } = useAuth();
    const [adoptions, setAdoptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
    const [updating, setUpdating] = useState<number | null>(null);
    const [error, setError] = useState('');

    const fetchAdoptions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/procesos-adopcion');
            // ADOPCIONES_DATA - La API ahora devuelve relaciones usuario y animalito
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setAdoptions(data);
        } catch {
            setError('Error al cargar los procesos de adopción.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdoptions(); }, []);

    // HANDLE_STATUS - Admin aprueba o rechaza solicitud. Usa 'estado_solicitud' (campo real DB)
    const handleStatusChange = async (id: number, newStatus: string) => {
        setUpdating(id);
        try {
            // ESTADO_FIELD_FIX - Enviar 'estado' como alias; el controller normaliza a 'estado_solicitud'
            await api.put(`/procesos-adopcion/${id}`, { estado: newStatus });
            setAdoptions(prev => prev.map(a => {
                const aId = a.id_solicitud ?? a.id;
                return aId === id
                    ? { ...a, estado_solicitud: newStatus }
                    : a;
            }));
        } catch {
            setError('No se pudo actualizar el estado. Intenta de nuevo.');
        } finally {
            setUpdating(null);
        }
    };

    // FILTER_ADOPCIONES - Usar 'estado_solicitud' (campo correcto de la DB)
    const filtered = filterStatus === 'todos'
        ? adoptions
        : adoptions.filter(a => a.estado_solicitud === filterStatus);

    const counts = {
        todos:     adoptions.length,
        pendiente: adoptions.filter(a => a.estado_solicitud === 'pendiente').length,
        aprobado:  adoptions.filter(a => a.estado_solicitud === 'aprobado').length,
        rechazado: adoptions.filter(a => a.estado_solicitud === 'rechazado').length,
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Procesos de Adopción" userName={user?.nombre_completo} />

                <div style={{ padding: '1.5rem 2rem' }}>
                    {/* HEADER_ADOPCIONES */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
                                Gestión de Adopciones
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {counts.pendiente} solicitudes pendientes de revisión
                            </p>
                        </div>
                        <button onClick={fetchAdoptions} className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                            <RefreshCw size={15} /> Actualizar
                        </button>
                    </div>

                    {/* STATUS_FILTER_TABS */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {(['todos', 'pendiente', 'aprobado', 'rechazado'] as const).map(status => {
                            const count = counts[status];
                            const isActive = filterStatus === status;
                            const cfg = status !== 'todos' ? STATUS_CONFIG[status] : null;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem',
                                        fontWeight: 600, cursor: 'pointer', border: 'none',
                                        backgroundColor: isActive ? (cfg?.bg ?? 'var(--color-dark)') : '#f1f5f9',
                                        color: isActive ? (cfg?.color ?? '#fff') : '#64748b',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        fontFamily: 'var(--font-family)', transition: 'all 0.15s ease'
                                    }}
                                >
                                    {cfg?.icon}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                    <span style={{
                                        backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px',
                                        padding: '0.05rem 0.4rem', fontSize: '0.75rem', fontWeight: 700
                                    }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto', width: '36px', height: '36px', borderWidth: '4px' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
                            <ClipboardList size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                                No hay procesos de adopción {filterStatus !== 'todos' ? `con estado "${filterStatus}"` : ''}.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filtered.map(a => {
                                // ADOPCION_ID_RESOLVE - campo correcto de la DB es id_solicitud
                                const id = a.id_solicitud ?? a.id;
                                // ESTADO_SOLICITUD_RESOLVE - campo correcto de la DB
                                const status = (a.estado_solicitud ?? 'pendiente') as keyof typeof STATUS_CONFIG;
                                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendiente;
                                const isUpdating = updating === id;

                                // RELACIONES_RESOLVE - usuario y animalito cargados por el controller
                                const nombreUsuario = a.usuario?.nombre_completo ?? `Usuario #${a.id_usuario}`;
                                const nombreMascota = a.animalito?.nombre ?? `Mascota #${a.id_animalito}`;
                                const fotoMascota = a.animalito?.fotos?.[0]?.archivo;

                                return (
                                    <div key={id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
                                                {/* MASCOTA_THUMBNAIL */}
                                                <div style={{
                                                    width: '56px', height: '56px', borderRadius: '12px',
                                                    backgroundColor: '#f1f5f9', flexShrink: 0, overflow: 'hidden',
                                                    backgroundImage: fotoMascota ? `url(${getFullImageUrl(fotoMascota)})` : 'none',
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {!fotoMascota && <PawPrint size={24} color="#94a3b8" />}
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)' }}>
                                                            {nombreMascota}
                                                        </span>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                            backgroundColor: cfg.bg, color: cfg.color,
                                                            padding: '0.2rem 0.65rem', borderRadius: '20px',
                                                            fontSize: '0.78rem', fontWeight: 700
                                                        }}>
                                                            {cfg.icon} {cfg.label}
                                                        </span>
                                                    </div>

                                                    {/* SOLICITANTE_INFO */}
                                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.875rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <User size={13} /> {nombreUsuario}
                                                        </span>
                                                        {a.fecha_creacion && (
                                                            <span>
                                                                {new Date(a.fecha_creacion).toLocaleDateString('es-MX', {
                                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* NOTA_SOLICITUD */}
                                                    {(a.nota || a.notas) && (
                                                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                                            {a.nota ?? a.notas}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ACTION_BUTTONS */}
                                            {status === 'pendiente' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                    <button
                                                        id={`approve-${id}`}
                                                        onClick={() => handleStatusChange(id, 'aprobado')}
                                                        disabled={isUpdating}
                                                        className="btn"
                                                        style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.85rem', padding: '0.5rem 1rem', opacity: isUpdating ? 0.6 : 1 }}
                                                    >
                                                        <CheckCircle size={15} /> Aprobar
                                                    </button>
                                                    <button
                                                        id={`reject-${id}`}
                                                        onClick={() => handleStatusChange(id, 'rechazado')}
                                                        disabled={isUpdating}
                                                        className="btn"
                                                        style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.85rem', padding: '0.5rem 1rem', opacity: isUpdating ? 0.6 : 1 }}
                                                    >
                                                        <XCircle size={15} /> Rechazar
                                                    </button>
                                                </div>
                                            )}
                                            {status !== 'pendiente' && (
                                                <button
                                                    id={`revert-${id}`}
                                                    onClick={() => handleStatusChange(id, 'pendiente')}
                                                    disabled={isUpdating}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.8rem', opacity: isUpdating ? 0.6 : 1 }}
                                                >
                                                    Revertir a Pendiente
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
