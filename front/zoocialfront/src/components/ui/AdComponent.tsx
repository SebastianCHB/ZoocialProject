import { ExternalLink } from 'lucide-react';

export const AdComponent = () => {
    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.7rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#bbf7d0', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                Patrocinado
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)', fontSize: '2rem', flexShrink: 0 }}>
                    🐾
                </div>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '1.1rem', fontWeight: 700 }}>
                        Alimento Premium para Mascotas Felices
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#15803d', fontSize: '0.9rem', lineHeight: 1.4 }}>
                        Descubre nuestra nueva línea nutritiva. Usa el código <strong>ZOOCIAL20</strong> para un 20% de descuento en tu primera compra en nuestra tienda.
                    </p>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                        Ver Oferta
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};
