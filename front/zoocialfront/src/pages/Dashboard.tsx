import { useEffect, useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Users, PawPrint, Heart, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import api from '../api/axios';

interface DashboardStats {
    usuarios: number;
    animalitos: number;
    adopciones: number;
    validaciones: number;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace un momento';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
}

export const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ usuarios: 0, animalitos: 0, adopciones: 0, validaciones: 0 });
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [recentValidations, setRecentValidations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.rol !== 'admin') { setLoading(false); return; }

        const fetchAll = async () => {
            try {
                const [userRes, petsRes, adopRes, valRes, postRes] = await Promise.all([
                    api.get('/usuarios'),
                    api.get('/animalito'),
                    api.get('/procesos-adopcion'),
                    api.get('/validations'),
                    api.get('/posts'),
                ]);

                const pendingValidations = valRes.data.filter((v: any) => v.estado === 'pendiente');

                setStats({
                    usuarios: userRes.data.length ?? 0,
                    animalitos: Array.isArray(petsRes.data) ? petsRes.data.length : (petsRes.data?.data?.length ?? 0),
                    adopciones: Array.isArray(adopRes.data) ? adopRes.data.length : (adopRes.data?.data?.length ?? 0),
                    validaciones: pendingValidations.length ?? 0,
                });

                // Recent posts (last 5)
                const posts = Array.isArray(postRes.data) ? postRes.data : [];
                setRecentPosts(posts.slice(0, 5));

                // Recent pending validations (last 3)
                setRecentValidations(pendingValidations.slice(0, 3));
            } catch (error) {
                console.error("Error fetching dashboard statistics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user]);

    const statCards = [
        { title: 'Usuarios Registrados', value: stats.usuarios, icon: <Users size={20} />, color: '#0056B8', bg: '#eff6ff' },
        { title: 'Mascotas', value: stats.animalitos, icon: <PawPrint size={20} />, color: '#16a34a', bg: '#f0fdf4' },
        { title: 'Procesos de Adopción', value: stats.adopciones, icon: <Heart size={20} />, color: '#ea580c', bg: '#fff7ed' },
        { title: 'Validaciones Ptes.', value: stats.validaciones, icon: <AlertCircle size={20} />, color: '#dc2626', bg: '#fef2f2' },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Panel Administrador" userName={user?.nombre_completo} />

                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem 2rem' }}>
                        {/* Greeting */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
                                Resumen General
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                Bienvenido de nuevo, {user?.nombre_completo?.split(' ')[0]}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {statCards.map(card => (
                                <div key={card.title} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>{card.title}</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-dark)', lineHeight: 1 }}>{card.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Recent Posts */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <MessageSquare size={18} color="var(--color-accent)" />
                                    <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Publicaciones Recientes</h2>
                                </div>
                                {recentPosts.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin publicaciones recientes.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {recentPosts.map(post => (
                                            <div key={post.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                                    {post.usuario?.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.15rem', textTransform: 'capitalize' }}>
                                                        {post.usuario?.nombre_completo || 'Usuario'}
                                                    </div>
                                                    <div className="truncate" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {post.content || '(Sin texto)'}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <Clock size={10} /> {timeAgo(post.created_at)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Validations */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <AlertCircle size={18} color="#dc2626" />
                                    <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Validaciones Pendientes</h2>
                                </div>
                                {recentValidations.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>✅ No hay validaciones pendientes.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {recentValidations.map(val => (
                                            <div key={val.id} style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '0.65rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div className="truncate" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#991b1b' }}>
                                                        ID: {val.id_usuario ?? val.id}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.1rem' }}>
                                                        Requiere revisión
                                                    </div>
                                                </div>
                                                <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '8px', flexShrink: 0 }}>
                                                    PENDIENTE
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
