import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Heart, Gift, X, Plus, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useStreak } from '../api/useStreak';

import { getFullImageUrl } from '../utils/imageUrl';


const CATEGORIES = ['Todos', 'Perros', 'Gatos', 'Aves', 'Otros'];

const DonationPayPal = ({ amount, onSuccess, onCancel }: { amount: string; onSuccess: () => void; onCancel: () => void }) => {
    const [{ isPending }] = usePayPalScriptReducer();
    const { user } = useAuth();
    const [error, setError] = useState('');

    const usdAmount = (parseFloat(amount) / 17).toFixed(2);

    const handleApprove = async (_data: any, actions: any) => {
        try {
            const details = await actions.order.capture();
            try {
                await api.post('/payments/record', {
                    paypal_order_id: details.id,
                    amount: parseFloat(amount),
                    type: 'donation',
                    description: `Donación a refugio - ${user?.nombre_completo}`,
                });
            } catch (e) { console.warn('record failed', e); }
            onSuccess();
        } catch {
            setError('El pago no se pudo completar. Intenta de nuevo.');
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Tu donación</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>${parseFloat(amount).toFixed(2)} MXN</div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', opacity: 0.7 }}>≈ USD ${usdAmount}</div>
            </div>
            {error && <div className="alert-error">{error}</div>}
            {isPending ? (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div className="spinner" style={{ margin: '0 auto', borderTopColor: '#16a34a' }} />
                </div>
            ) : (
                <div className="paypal-container">
                    <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'donate' }}
                        createOrder={(_d, actions) => actions.order.create({
                            intent: 'CAPTURE',
                            purchase_units: [{
                                amount: { currency_code: 'USD', value: usdAmount },
                                description: 'Donación a refugio Zoocial',
                            }]
                        })}
                        onApprove={handleApprove}
                        onError={() => setError('Error en PayPal. Intenta de nuevo.')}
                        onCancel={onCancel}
                    />
                </div>
            )}
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                Pago seguro con PayPal Sandbox
            </p>
        </div>
    );
};

export const Adoptions = () => {
    const { user } = useAuth();
    const { pingStreak } = useStreak();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Todos');

    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isDonationOpen, setIsDonationOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState('5');
    const [donationSuccess, setDonationSuccess] = useState(false);

    const [adoptionLoading, setAdoptionLoading] = useState(false);
    const [adoptionSuccess, setAdoptionSuccess] = useState(false);
    const [adoptionError, setAdoptionError] = useState('');

    // Add pet form
    const [newName, setNewName] = useState('');
    const [newEspecie, setNewEspecie] = useState('Perro');
    const [newRaza, setNewRaza] = useState('');
    const [newEdad, setNewEdad] = useState('');
    const [newGenero, setNewGenero] = useState('Macho');
    const [newSize, setNewSize] = useState('Mediano');
    const [newDesc, setNewDesc] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [addError, setAddError] = useState('');

    const [viewerImage, setViewerImage] = useState<string | null>(null);

    useEffect(() => { fetchPets(); }, []);

    const fetchPets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/animalito');
            setPets(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch {
            setPets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPets = pets.filter(pet => {
        if (activeFilter === 'Todos') return true;
        const especie = (pet.especie || '').toLowerCase();
        if (activeFilter === 'Perros') return especie.includes('perro') || especie.includes('canino') || especie === '1';
        if (activeFilter === 'Gatos') return especie.includes('gato') || especie.includes('felino') || especie === '2';
        if (activeFilter === 'Aves') return especie.includes('ave') || especie.includes('pajaro') || especie === '3';
        return true;
    });

    const handleAdoptionRequest = async () => {
        if (!selectedPet || !user) return;
        setAdoptionLoading(true);
        setAdoptionError('');
        try {
            await api.post('/procesos-adopcion', {
                id_animalito: selectedPet.id_animalito,
                id_usuario: user.id_usuario,
                estado: 'pendiente',
                notas: `Solicitud de adopción de ${user.nombre_completo}`,
            });
            setAdoptionSuccess(true);
            await pingStreak(); // Interaction counts for streak
        } catch (err: any) {
            setAdoptionError(err.response?.data?.message || 'No se pudo enviar la solicitud. Intenta de nuevo.');
        } finally {
            setAdoptionLoading(false);
        }
    };

    const handleAddPet = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setAddError('');
        try {
            const formData = new FormData();
            formData.append('nombre', newName);
            formData.append('especie', newEspecie);
            formData.append('raza', newRaza || 'Mestizo');
            formData.append('edad_estimada', newEdad);
            formData.append('sexo', newGenero.toLowerCase());
            formData.append('tamaño', newSize.toLowerCase());
            formData.append('historia', newDesc);
            formData.append('estado_adopcion', 'disponible');
            if (imageFile) formData.append('imagenes[]', imageFile);

            await api.post('/animalito', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowAddModal(false);
            setNewName(''); setNewEspecie('Perro'); setNewRaza(''); setNewEdad('');
            setNewGenero('Macho'); setNewSize('Mediano'); setNewDesc('');
            setImageFile(null); setImagePreview(null);
            fetchPets();
        } catch (err: any) {
            setAddError(err.response?.data?.message || 'No se pudo agregar la mascota.');
        } finally {
            setSaving(false);
        }
    };

    const canAddPet = ['rescatista', 'veterinario', 'admin'].includes(user?.rol || '');

    const statusMap: Record<string, { bg: string; color: string; label: string }> = {
        disponible: { bg: '#f0fdf4', color: '#16a34a', label: 'Disponible' },
        en_proceso: { bg: '#fff7ed', color: '#ea580c', label: 'En Proceso' },
        adoptado: { bg: '#f8fafc', color: '#64748b', label: 'Adoptado' },
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Adopciones" userName={user?.nombre_completo} />

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>
                                Mascotas en Adopción 🐾
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                Dale un hogar a quien lo necesita
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => { setIsDonationOpen(true); setDonationSuccess(false); setDonationAmount('5'); }}
                                className="btn btn-secondary"
                                style={{ gap: '0.4rem', fontSize: '0.85rem' }}
                            >
                                <Gift size={16} /> Donar
                            </button>
                            {canAddPet && (
                                <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                                    <Plus size={16} /> Agregar Mascota
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '20px', whiteSpace: 'nowrap',
                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', border: 'none',
                                    backgroundColor: activeFilter === cat ? 'var(--color-dark)' : '#f1f5f9',
                                    color: activeFilter === cat ? 'white' : '#64748b',
                                    transition: 'all 0.2s', fontFamily: 'var(--font-family)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Pets Grid */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                            <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '4px' }} />
                        </div>
                    ) : filteredPets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                            <Heart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p>No hay mascotas con este filtro.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                            {filteredPets.map(pet => {
                                const status = pet.estado_adopcion ?? 'disponible';
                                const sb = statusMap[status] ?? statusMap.disponible;
                                const img = pet.fotos?.[0]?.archivo ?? pet.imagen_url ?? '';
                                const isAvailable = status === 'disponible';

                                return (
                                    <div
                                        key={pet.id_animalito}
                                        className="card card-hover"
                                        style={{ padding: 0, overflow: 'hidden' }}
                                        onClick={() => { setSelectedPet(pet); setAdoptionSuccess(false); setAdoptionError(''); }}
                                    >
                                        <div style={{ height: '180px', backgroundColor: '#f1f5f9', backgroundImage: img ? `url(${getFullImageUrl(img)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                            {!img && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
                                                    {newEspecie === 'Gato' ? '🐱' : '🐶'}
                                                </div>
                                            )}
                                            <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', backgroundColor: sb.bg, color: sb.color, padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {sb.label}
                                            </span>
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)', margin: 0 }}>{pet.nombre}</h3>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>{pet.sexo ?? pet.genero ?? 'N/A'}</span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem', textTransform: 'capitalize' }}>
                                                {pet.tamaño} · {pet.edad_estimada} años
                                            </p>
                                            <button
                                                className="btn btn-full"
                                                disabled={!isAvailable}
                                                style={{ backgroundColor: isAvailable ? 'var(--color-dark)' : '#f1f5f9', color: isAvailable ? 'white' : '#94a3b8', borderRadius: '10px', fontSize: '0.875rem', padding: '0.6rem' }}
                                                onClick={e => { e.stopPropagation(); setSelectedPet(pet); setAdoptionSuccess(false); setAdoptionError(''); }}
                                            >
                                                {isAvailable ? ' Solicitar Adopción' : 'No disponible'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pet Detail / Adoption Modal */}
                {selectedPet && (
                    <div className="modal-backdrop" onClick={() => setSelectedPet(null)}>
                        <div className="modal-box" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                    {selectedPet.nombre}
                                </h2>
                                <button onClick={() => setSelectedPet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {adoptionSuccess ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                    <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <CheckCircle size={36} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', marginBottom: '0.5rem' }}>¡Solicitud Enviada!</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                        Tu solicitud para adoptar a <strong>{selectedPet.nombre}</strong> ha sido enviada. El equipo te contactará pronto.
                                    </p>
                                    <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setSelectedPet(null)}>
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Pet info */}
                                    {selectedPet.fotos?.[0]?.archivo && (
                                        <img
                                            src={getFullImageUrl(selectedPet.fotos[0].archivo)}
                                            alt={selectedPet.nombre}
                                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem', cursor: 'zoom-in' }}
                                            onClick={() => setViewerImage(getFullImageUrl(selectedPet.fotos[0].archivo) || null)}
                                        />
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Especie', value: selectedPet.especie || 'N/A' },
                                            { label: 'Raza', value: selectedPet.raza || 'Mestizo' },
                                            { label: 'Género', value: selectedPet.sexo || selectedPet.genero || 'N/A' },
                                            { label: 'Edad', value: `${selectedPet.edad_estimada ?? 'N/A'} años` },
                                            { label: 'Tamaño', value: selectedPet.tamaño || 'N/A' },
                                            { label: 'Peso', value: selectedPet.peso ? `${selectedPet.peso} lbs` : 'N/A' },
                                        ].map(item => (
                                            <div key={item.label} style={{ backgroundColor: '#f8fafc', padding: '0.65rem 0.875rem', borderRadius: '10px' }}>
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600, textTransform: 'capitalize' }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedPet.historia && (
                                        <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', marginBottom: '1rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>{selectedPet.historia}</p>
                                        </div>
                                    )}
                                    {adoptionError && (
                                        <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertCircle size={16} /> {adoptionError}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={handleAdoptionRequest}
                                        disabled={adoptionLoading || selectedPet.estado_adopcion !== 'disponible'}
                                        style={{ padding: '0.875rem', borderRadius: '12px', gap: '0.5rem', opacity: selectedPet.estado_adopcion !== 'disponible' ? 0.5 : 1 }}
                                    >
                                        {adoptionLoading ? (
                                            <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }} /> Enviando...</>
                                        ) : (
                                            <><Heart size={17} /> Solicitar Adopción</>
                                        )}
                                    </button>
                                    {selectedPet.estado_adopcion !== 'disponible' && (
                                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Esta mascota ya no está disponible para adopción.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Donation Modal */}
                {isDonationOpen && (
                    <div className="modal-backdrop" onClick={() => !donationSuccess && setIsDonationOpen(false)}>
                        <div className="modal-box" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                            {donationSuccess ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                    <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <CheckCircle size={36} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', marginBottom: '0.5rem' }}>¡Gracias por tu Donación!</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Tu contribución ayuda a cuidar a los animales que esperan un hogar.</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setIsDonationOpen(false)}>
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Gift size={18} color="#16a34a" /> Donar al Refugio
                                        </h2>
                                        <button onClick={() => setIsDonationOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                        Cada peso cuenta. Tu donación se destina al cuidado y alimentación de los animales del refugio.
                                    </p>
                                    {/* Amount presets */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {['5', '10', '25', '50'].map(a => (
                                            <button
                                                key={a}
                                                onClick={() => setDonationAmount(a)}
                                                style={{ padding: '0.65rem', borderRadius: '10px', border: `2px solid ${donationAmount === a ? '#16a34a' : '#e2e8f0'}`, backgroundColor: donationAmount === a ? '#dcfce7' : 'white', color: donationAmount === a ? '#166534' : '#334155', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-family)' }}
                                            >
                                                ${a}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>O ingresa una cantidad personalizada (USD)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={donationAmount}
                                            onChange={e => setDonationAmount(e.target.value)}
                                            min="1"
                                            step="0.5"
                                        />
                                    </div>
                                    <DonationPayPal
                                        amount={donationAmount}
                                        onSuccess={() => setDonationSuccess(true)}
                                        onCancel={() => setIsDonationOpen(false)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Pet Modal */}
                {showAddModal && (
                    <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
                        <div className="modal-box" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Registrar Nueva Mascota</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {addError && <div className="alert-error">{addError}</div>}

                            <form onSubmit={handleAddPet} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                {/* Photo upload */}
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', height: '120px', cursor: 'pointer', backgroundColor: '#f8fafc', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                    ) : (
                                        <><Camera size={24} color="#94a3b8" /> <span>Agregar foto</span></>
                                    )}
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Nombre *</label>
                                        <input type="text" className="input-field" required value={newName} onChange={e => setNewName(e.target.value)} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Especie</label>
                                        <select className="input-field" value={newEspecie} onChange={e => setNewEspecie(e.target.value)}>
                                            <option>Perro</option><option>Gato</option><option>Ave</option><option>Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Raza</label>
                                        <input type="text" className="input-field" value={newRaza} onChange={e => setNewRaza(e.target.value)} placeholder="Mestizo" />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Edad estimada (años)</label>
                                        <input type="number" step="0.5" className="input-field" required value={newEdad} onChange={e => setNewEdad(e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Género</label>
                                        <select className="input-field" value={newGenero} onChange={e => setNewGenero(e.target.value)}>
                                            <option>Macho</option><option>Hembra</option>
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Tamaño</label>
                                        <select className="input-field" value={newSize} onChange={e => setNewSize(e.target.value)}>
                                            <option>Pequeño</option><option>Mediano</option><option>Grande</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Historia / Descripción</label>
                                    <textarea className="input-field" rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Cuéntanos sobre esta mascota..." />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
                                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowAddModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                                        {saving ? 'Guardando...' : 'Registrar Mascota'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Image Viewer */}
                {viewerImage && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewerImage(null)}>
                        <button onClick={() => setViewerImage(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}>
                            <X size={32} />
                        </button>
                        <img src={viewerImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                    </div>
                )}
            </main>
        </div>
    );
};
