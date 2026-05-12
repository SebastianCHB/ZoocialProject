import { useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { ShoppingCart, X, CheckCircle, Package } from 'lucide-react';
import api from '../api/axios';

const mockProducts = [
    { id: '1', name: 'Collar Ajustable Reflectivo', price: 150.00, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1602521921312-3f1cf17c6a51?w=400&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Correa Retráctil Premium', price: 220.00, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop&q=80' },
    { id: '3', name: 'Croquetas Premium 2kg', price: 450.00, category: 'Alimento', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop&q=80' },
    { id: '4', name: 'Juguete Cuerda Interactivo', price: 85.00, category: 'Juguetes', image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&auto=format&fit=crop&q=80' },
    { id: '5', name: 'Cama Ortopédica Mascotas', price: 580.00, category: 'Descanso', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop&q=80' },
    { id: '6', name: 'Transportadora Rígida L', price: 720.00, category: 'Transporte', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=80' },
];

const categoryColors: Record<string, string> = {
    'Accesorios': '#eff6ff',
    'Alimento': '#f0fdf4',
    'Juguetes': '#fdf4ff',
    'Descanso': '#fff7ed',
    'Transporte': '#f8fafc',
};

const PayPalCheckout = ({ product, onSuccess, onCancel }: { product: any; onSuccess: () => void; onCancel: () => void }) => {
    const [{ isPending }] = usePayPalScriptReducer();
    const [error, setError] = useState('');
    // PAYPAL_ERROR_HANDLER - Detectar si PayPal no carga en tiempo razonable
    const [loadTimeout, setLoadTimeout] = useState(false);

    // Si después de 8 segundos sigue pendiente, asumir que está bloqueado
    useState(() => {
        const timer = setTimeout(() => {
            if (isPending) setLoadTimeout(true);
        }, 8000);
        return () => clearTimeout(timer);
    });

    const handleApprove = async (_data: any, actions: any) => {
        try {
            const details = await actions.order.capture();
            // Registrar pago en el backend
            try {
                await api.post('/payments/record', {
                    paypal_order_id: details.id,
                    amount: product.price,
                    type: 'purchase',
                    description: product.name,
                });
            } catch (e) {
                console.warn('Could not record payment:', e);
            }
            onSuccess();
        } catch (e) {
            setError('El pago fue cancelado o no se procesó correctamente.');
        }
    };

    // PAYPAL_FALLBACK_UI - Si PayPal no carga, mostrar instrucción al usuario
    if (loadTimeout) {
        return (
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <p style={{ color: '#c2410c', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ PayPal no pudo cargar</p>
                <p style={{ color: '#9a3412', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Puede que tu navegador esté bloqueando el script de PayPal.<br />
                    Intenta deshabilitar bloqueadores de anuncios o abre en modo incógnito.
                </p>
                <button onClick={onCancel} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', background: '#f97316', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Cerrar
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Total a pagar:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>${product.price.toFixed(2)} MXN</span>
            </div>
            {error && <div className="alert-error">{error}</div>}
            {isPending ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto', width: '32px', height: '32px', borderWidth: '3px' }} />
                    <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>Cargando PayPal...</p>
                </div>
            ) : (
                <div className="paypal-container">
                    <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }}
                        // PAYPAL_ORDER_V2 - Estructura correcta para PayPal Orders API v2
                        createOrder={(_data, actions) => {
                            return actions.order.create({
                                intent: 'CAPTURE',
                                purchase_units: [{
                                    amount: {
                                        currency_code: 'USD',
                                        value: (product.price / 17).toFixed(2), // MXN → USD aprox
                                    },
                                    description: product.name,
                                }],
                            });
                        }}
                        onApprove={handleApprove}
                        onError={(err) => {
                            console.error('PayPal error:', err);
                            setError('Ocurrió un error con PayPal. Intenta de nuevo.');
                        }}
                        onCancel={onCancel}
                        onInit={() => setLoadTimeout(false)} // SDK cargó correctamente
                    />
                </div>
            )}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                🔒 Pago seguro procesado por PayPal Sandbox
            </p>
        </div>
    );
};

export const Store = () => {
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');

    const categories = ['Todos', ...Array.from(new Set(mockProducts.map(p => p.category)))];
    const filtered = activeCategory === 'Todos' ? mockProducts : mockProducts.filter(p => p.category === activeCategory);

    const handleBuy = (product: any) => {
        setSelectedProduct(product);
        setPaymentSuccess(false);
    };

    const handleSuccess = () => {
        setPaymentSuccess(true);
        setTimeout(() => {
            setSelectedProduct(null);
            setPaymentSuccess(false);
        }, 4000);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Tienda Zoocial" userName={user?.nombre_completo} />

                <div style={{ padding: '1.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                    {/* Hero Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                        borderRadius: '20px', padding: '2rem 2.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '2rem', color: 'white', overflow: 'hidden', position: 'relative'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tienda para tus Peluditos 🐾</h2>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Con cada compra apoyas a refugios locales de animales.</p>
                        </div>
                        <ShoppingCart size={64} style={{ opacity: 0.2, flexShrink: 0 }} />
                    </div>

                    {/* Category filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '0.5rem 1.1rem', borderRadius: '20px', whiteSpace: 'nowrap',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', border: 'none',
                                    backgroundColor: activeCategory === cat ? '#f59e0b' : '#f1f5f9',
                                    color: activeCategory === cat ? '#fff' : '#64748b',
                                    transition: 'all 0.2s', fontFamily: 'var(--font-family)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                        {filtered.map(product => (
                            <div key={product.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    height: '200px', backgroundImage: `url(${product.image})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                                    backgroundColor: '#f1f5f9'
                                }}>
                                    <span style={{
                                        position: 'absolute', top: '0.75rem', left: '0.75rem',
                                        backgroundColor: categoryColors[product.category] || '#f1f5f9',
                                        color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '8px',
                                        fontSize: '0.72rem', fontWeight: 700
                                    }}>
                                        {product.category}
                                    </span>
                                </div>
                                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.25rem' }}>{product.name}</h4>
                                        <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>${product.price.toFixed(2)} MXN</p>
                                    </div>
                                    <button
                                        className="btn btn-accent btn-full"
                                        onClick={() => handleBuy(product)}
                                        style={{ borderRadius: '10px' }}
                                    >
                                        <ShoppingCart size={16} /> Comprar con PayPal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout Modal */}
                {selectedProduct && (
                    <div className="modal-backdrop" onClick={() => !paymentSuccess && setSelectedProduct(null)}>
                        <div className="modal-box" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
                            {paymentSuccess ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                        <CheckCircle size={36} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>¡Compra Exitosa!</h3>
                                    <p style={{ color: '#15803d', fontSize: '0.95rem' }}>
                                        Tu pedido de <strong>{selectedProduct.name}</strong> está siendo procesado. Recibirás confirmación pronto.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={18} color="#f59e0b" />
                                            {selectedProduct.name}
                                        </h2>
                                        <button onClick={() => setSelectedProduct(null)} style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <PayPalCheckout
                                        product={selectedProduct}
                                        onSuccess={handleSuccess}
                                        onCancel={() => setSelectedProduct(null)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
