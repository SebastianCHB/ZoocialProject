import { useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CreditCard, X, CheckCircle } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Collar Ajustable Reflectivo', price: 150.00, formattedPrice: '$150.00', image: 'https://images.unsplash.com/photo-1602521921312-3f1cf17c6a51?w=400&auto=format&fit=crop' },
  { id: '2', name: 'Correa Retráctil', price: 220.00, formattedPrice: '$220.00', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop' },
  { id: '3', name: 'Croquetas Premium 2kg', price: 450.00, formattedPrice: '$450.00', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop' },
  { id: '4', name: 'Juguete Cuerda Bicolor', price: 85.00, formattedPrice: '$85.00', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop' },
];

export const Store = () => {
    const { user } = useAuth();
    
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const handleBuyClick = (product: any) => {
        setSelectedProduct(product);
        setPaymentSuccess(false);
        setIsCheckoutOpen(true);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingPayment(true);
        setTimeout(() => {
            setProcessingPayment(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                setIsCheckoutOpen(false);
                setPaymentSuccess(false);
                setSelectedProduct(null);
            }, 3000);
        }, 2000);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Tienda Zoocial" userName={user?.nombre_completo} />
                <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                    
                    <div style={{ backgroundColor: '#f59e0b', borderRadius: '1rem', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', color: 'white' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ofertas Especiales</h2>
                            <p style={{ opacity: 0.9 }}>Con cada compra ayudas a refugios locales.</p>
                        </div>
                        <ShoppingCart size={48} opacity={0.3} />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Productos Destacados</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {mockProducts.map(product => (
                            <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    height: '200px', 
                                    backgroundImage: `url(${product.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }} />
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>{product.name}</h4>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginBottom: '1.5rem' }}>{product.formattedPrice}</p>
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        <button 
                                            className="btn btn-primary btn-full"
                                            onClick={() => handleBuyClick(product)}
                                            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b', fontWeight: 600 }}
                                        >
                                            Comprar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout Modal */}
                {isCheckoutOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingCart size={24} color="#f59e0b" />
                                    Comprar {selectedProduct?.name}
                                </h2>
                                <button onClick={() => setIsCheckoutOpen(false)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {paymentSuccess ? (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                        <CheckCircle size={32} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '0.5rem' }}>¡Compra Exitosa!</h3>
                                    <p style={{ color: '#15803d' }}>Tu pedido de {selectedProduct?.name} está siendo procesado.</p>
                                </div>
                            ) : (
                                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                                        Completa tu pago seguro con tarjeta de crédito/débito.
                                    </p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Total a pagar:</span>
                                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>{selectedProduct?.formattedPrice}</span>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CreditCard size={16} /> Número de Tarjeta
                                        </label>
                                        <input type="text" className="input-field" placeholder="0000 0000 0000 0000" required />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="input-group">
                                            <label className="input-label">Vencimiento</label>
                                            <input type="text" className="input-field" placeholder="MM/AA" required />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">CVV</label>
                                            <input type="password" className="input-field" placeholder="123" required />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Nombre en la tarjeta</label>
                                        <input type="text" className="input-field" placeholder="Juan Pérez" required />
                                    </div>

                                    <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0, textAlign: 'center' }}>
                                            Pago seguro procesado por Stripe.
                                        </p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        disabled={processingPayment}
                                        style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f59e0b', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: processingPayment ? 0.7 : 1 }}
                                    >
                                        {processingPayment ? 'Procesando...' : `Pagar ${selectedProduct?.formattedPrice}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
