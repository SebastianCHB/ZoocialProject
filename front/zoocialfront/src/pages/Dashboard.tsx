import { useEffect, useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Heart, AlertCircle } from 'lucide-react';
import api from '../api/axios';

interface DashboardStats {
    usuarios: number;
    animalitos: number;
    adopciones: number;
    validaciones: number;
}

export const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ usuarios: 0, animalitos: 0, adopciones: 0, validaciones: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [userRes, petsRes, adopRes, valRes] = await Promise.all([
                    api.get('/usuarios'),
                    api.get('/animalito'), // Assuming the resource is animalito based on API routes
                    api.get('/procesos-adopcion'),
                    api.get('/validations') // The newly created admin endpoint
                ]);
                
                // Filter adoptions and validations by pending status if needed, 
                // or just show total counts as in the design.
                const pendingValidations = valRes.data.filter((v: any) => v.estado === 'pendiente');

                setStats({
                    usuarios: userRes.data.length || 0,
                    animalitos: petsRes.data.length || 0,
                    adopciones: adopRes.data.length || 0,
                    validaciones: pendingValidations.length || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard statistics", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.rol === 'admin') {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    const AdminView = () => (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-dark)' }}>
                Resumen General
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Usuarios Registrados" value={stats.usuarios} icon={<Users />} color="var(--color-accent)" />
                <StatCard title="Mascotas" value={stats.animalitos} icon={<FileText />} color="var(--color-primary)" />
                <StatCard title="Procesos de Adopción" value={stats.adopciones} icon={<Heart />} color="#10b981" />
                <StatCard title="Validaciones Ptes." value={stats.validaciones} icon={<AlertCircle />} color="var(--color-error)" />
            </div>
            
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Actividad Reciente</h2>
                <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Sin actividad reciente que mostrar por el momento.
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Administración" userName={user?.nombre_completo} primaryActionLabel="Nuevo Reporte" />
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando datos...</div>
                ) : (
                    <AdminView />
                )}
            </main>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
        <div style={{ 
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
            backgroundColor: `${color}15`, color, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)' }}>{value}</div>
        </div>
    </div>
);
