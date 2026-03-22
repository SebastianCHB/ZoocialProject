import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Heart, Gift, X, Plus, Activity, Camera } from 'lucide-react';
import api from '../api/axios';

const categories = ['Todos', 'Perros', 'Gatos', 'Aves', 'Otros'];

export const Adoptions = () => {
    const { user } = useAuth();
    const [pets, setPets] = useState<any[]>([]);
    const [loadingPets, setLoadingPets] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Todos');

    const [selectedPet, setSelectedPet] = useState<any>(null); // Details Modal
    const [showAddModal, setShowAddModal] = useState(false); // Add Pet Modal
    const [isDonationOpen, setIsDonationOpen] = useState(false); // Donation Modal
    
    // Add Pet State
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

    // Checkout State
    const [donationAmount, setDonationAmount] = useState<string>('5');
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'card' | 'oxxo'>('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expDate, setExpDate] = useState('');
    const [cvv, setCvv] = useState('');
    
    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        setLoadingPets(true);
        try {
            const res = await api.get('/animalito');
            // Safely handle API shape changes to prevent white screen crashes
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setPets(data);
        } catch (error) {
            console.error("Error fetching feed", error);
            setPets([]); // Fallback
        } finally {
            setLoadingPets(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleAddPet = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('nombre', newName);
            formData.append('especie', newEspecie);
            formData.append('raza', newRaza || 'Mestizo');
            formData.append('edad_estimado', newEdad);
            formData.append('genero', newGenero);
            formData.append('tamaño', newSize);
            formData.append('descripcion', newDesc);
            formData.append('disponibilidad', 'Disponible'); // By default
            formData.append('notas_salud', 'Revisado por veterinario'); // Auto default
            
            if (imageFile) formData.append('imagenes[]', imageFile);

            await api.post('/animalito', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowAddModal(false);
            setNewName(''); setNewEspecie('Perro'); setNewRaza(''); setNewEdad(''); setNewGenero('Macho'); setNewSize('Mediano'); setNewDesc(''); setImageFile(null); setImagePreview(null);
            fetchFeed();
        } catch (error) {
            console.error(error);
            alert("No se pudo agregar la mascota");
        } finally {
            setSaving(false);
        }
    };

    const handleDonationClick = () => {
        setDonationSuccess(false);
        setProcessing(false);
        setIsDonationOpen(true);
        setDonationAmount('5');
        setCardNumber(''); setExpDate(''); setCvv('');
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDonationSuccess(true);
            setTimeout(() => {
                setIsDonationOpen(false);
            }, 3000);
        }, 2000);
    };

    // filter
    const filteredPets = pets.filter(p => activeFilter === 'Todos' || (p.especie && activeFilter.toLowerCase() === p.especie.toLowerCase()));

    // resolver
    const getFullImageUrl = (url: string) => {
        if (!url) return '';
        // absolute
        if (url.startsWith('http')) return url;
        // normalize
        const path = url.startsWith('/') ? url.slice(1) : url.startsWith('storage') ? url : 'storage/' + url;
        // relative
        return `/${path}`;
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
                <TopNav title="Centro de Adopciones" userName={user?.nombre_completo} />
                
                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    
                    {/* Header Controls - Centered for Desktop */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    style={{ 
                                        padding: '0.6rem 1.25rem', borderRadius: '8px', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', border: '1px solid transparent',
                                        backgroundColor: activeFilter === cat ? '#0c5cb3' : '#f1f5f9', color: activeFilter === cat ? '#fff' : '#475569', 
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 600, borderRadius: '8px' }}
                        >
                            <Plus size={20} />
                            Dar en Adopción
                        </button>
                    </div>

                    {/* Pets Grid */}
                    {loadingPets ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#0c5cb3', fontSize: '1.2rem', fontWeight: 500 }}>Buscando peluditos...</div>
                    ) : filteredPets.length === 0 ? (
                        <div style={{ textAlign: 'center', margin: '4rem 0', backgroundColor: 'white', padding: '4rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#f0f4f8', color: '#cbd5e1', marginBottom: '1rem' }}>
                                <Heart size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500 }}>No hay {activeFilter !== 'Todos' ? activeFilter.toLowerCase() : 'mascotas'} publicadas aún. Sé el primero.</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {filteredPets.map(pet => {
                                const imageUrl = pet.fotos && pet.fotos.length > 0 ? getFullImageUrl(pet.fotos[0].archivo) : null;
                                return (
                                <div 
                                    key={pet.id_animalito} 
                                    className="card" 
                                    onClick={() => setSelectedPet(pet)}
                                    style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'; }}
                                >
                                    <div style={{ 
                                        height: '240px', backgroundColor: '#f1f5f9', backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: pet.disponibilidad === 'Adoptado' ? '#e63946' : '#2a9d8f', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            {pet.disponibilidad || 'Disponible'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0, textTransform: 'capitalize' }}>{pet.nombre}</h3>
                                            <span style={{ backgroundColor: pet.genero?.toLowerCase() === 'macho' ? '#eff6ff' : '#fdf2f8', color: pet.genero?.toLowerCase() === 'macho' ? '#3b82f6' : '#ec4899', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                {pet.genero}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1rem', fontWeight: 500 }}>
                                            {typeof pet.raza === 'object' ? pet.raza?.raza || 'Mestizo' : pet.raza} • {pet.edad_estimado}
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>

                {/* Desktop Add Pet Modal */}
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ 
                            width: '90%', maxWidth: '800px', backgroundColor: 'white', borderRadius: '16px', 
                            padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Dar en Adopción</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddPet} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                    
                                    {/* Left Column - Image */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <label 
                                            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px dashed #cbd5e1', position: 'relative', transition: 'border-color 0.2s' }}
                                            onMouseOver={(e:any) => e.currentTarget.style.borderColor = '#94a3b8'}
                                            onMouseOut={(e:any) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <>
                                                    <Camera size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Subir Foto</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                        </label>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>Recomendado: Imagen cuadrada, de buena iluminación.</p>
                                    </div>

                                    {/* Right Column - Form Data */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Nombre de la mascota</label>
                                            <input type="text" value={newName} onChange={e=>setNewName(e.target.value)} required style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} placeholder="Ej. Firulais" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Especie</label>
                                            <select value={newEspecie} onChange={e=>setNewEspecie(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', backgroundColor: 'white' }}>
                                                <option>Perro</option><option>Gato</option><option>Ave</option><option>Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Raza</label>
                                            <input type="text" value={newRaza} onChange={e=>setNewRaza(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} placeholder="Ej. Mestizo" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Edad Estimada</label>
                                            <input type="text" value={newEdad} onChange={e=>setNewEdad(e.target.value)} placeholder="Ej. 2 meses" required style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Género</label>
                                            <select value={newGenero} onChange={e=>setNewGenero(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', backgroundColor: 'white' }}>
                                                <option>Macho</option><option>Hembra</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Tamaño</label>
                                            <select value={newSize} onChange={e=>setNewSize(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', backgroundColor: 'white' }}>
                                                <option>Pequeño</option><option>Mediano</option><option>Grande</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
                                            <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} required rows={4} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '1rem' }} placeholder="Escribe un poco sobre la personalidad y necesidades del animalito..." />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                    <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.875rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={saving || !newName} style={{ padding: '0.875rem 3rem', background: '#0c5cb3', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', display: 'flex', justifyContent: 'center', border: 'none', cursor: (saving || !newName) ? 'default' : 'pointer', opacity: (saving || !newName) ? 0.6 : 1 }}>
                                        {saving ? 'Guardando...' : 'Publicar Adopción'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Desktop Pet Details Modal */}
                {selectedPet && !isDonationOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '90%', maxWidth: '900px', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', maxHeight: '85vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                            <div style={{ flex: 1, backgroundColor: '#f1f5f9', backgroundImage: selectedPet.fotos?.length > 0 ? `url(${getFullImageUrl(selectedPet.fotos[0].archivo)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                {/* Image Area Left */}
                            </div>
                            
                            <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>{selectedPet.nombre}</h2>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <span style={{ backgroundColor: selectedPet.genero?.toLowerCase() === 'macho' ? '#eff6ff' : '#fdf2f8', color: selectedPet.genero?.toLowerCase() === 'macho' ? '#3b82f6' : '#ec4899', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                {selectedPet.genero}
                                            </span>
                                            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                {selectedPet.tamaño || 'Mediano'}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedPet(null)} style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem', display: 'flex', gap: '1.5rem', fontWeight: 500 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><strong>Raza:</strong> {typeof selectedPet.raza === 'object' ? selectedPet.raza?.raza || 'Mestizo' : selectedPet.raza}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><strong>Edad:</strong> {selectedPet.edad_estimado}</span>
                                </div>

                                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '8px' }}>
                                        <Activity color="#16a34a" size={24} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#166534', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Estado de Salud</div>
                                        <div style={{ color: '#15803d', fontSize: '0.9rem' }}>Vacunado • Desparasitado • En óptimas condiciones</div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Sobre mí</h3>
                                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: 'auto' }}>
                                    {selectedPet.descripcion || 'No hay descripción disponible para esta mascota. ¡Contáctanos para conocer más detalles y animarte a darle un nuevo hogar!'}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
                                    <button 
                                        style={{ width: '100%', background: '#0c5cb3', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onMouseOver={(e:any) => e.target.style.backgroundColor = '#0a4b94'}
                                        onMouseOut={(e:any) => e.target.style.backgroundColor = '#0c5cb3'}
                                    >
                                        Solicitar Adopción
                                    </button>

                                    <div style={{ backgroundColor: '#fff7ed', borderRadius: '8px', padding: '1.25rem', border: '1px solid #ffedd5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ color: '#9a3412', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                                <Gift size={20} /> Apadrina a {selectedPet.nombre}
                                            </h4>
                                        </div>
                                        <p style={{ color: '#c2410c', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                                            Ayúdanos a cubrir sus gastos de alimentación y atención veterinaria mientras encuentra un hogar.
                                        </p>
                                        <button onClick={handleDonationClick} style={{ backgroundColor: 'white', color: '#ea580c', border: '1px solid #ea580c', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, width: '100%', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            Donar Alimentos o Dinero
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Donation Checkout Modal */}
                {isDonationOpen && selectedPet && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ width: '100%', maxWidth: '550px', backgroundColor: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Terminar Pago Seguro</h2>
                                <button onClick={() => setIsDonationOpen(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '8px' }}><X size={20} /></button>
                            </div>

                            {donationSuccess ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                        <Heart size={40} fill="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', marginBottom: '1rem' }}>¡Transacción Exitosa!</h3>
                                    <p style={{ color: '#15803d', fontSize: '1.1rem' }}>Tu pago ha sido procesado correctamente. ¡Gracias por el apoyo hacia {selectedPet.nombre}!</p>
                                </div>
                            ) : processing ? (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                    <div className="spinner" style={{ borderTopColor: '#0c5cb3', margin: '0 auto 2rem auto', width: '50px', height: '50px', borderWidth: '4px' }}></div>
                                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>Procesando tu donativo de ${donationAmount}.00...</h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>Por favor no cierres esta ventana.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: '#475569', fontSize: '1rem', fontWeight: 600 }}>Total de la donación</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800 }}>${donationAmount}.00</div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>Método de Pago</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="button" onClick={() => setSelectedPayment('card')} style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '8px', border: selectedPayment === 'card' ? '2px solid #0c5cb3' : '1px solid #cbd5e1', backgroundColor: selectedPayment === 'card' ? '#eff6ff' : 'white', fontWeight: 600, color: selectedPayment === 'card' ? '#0c5cb3' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>Tarjeta Bancaria</button>
                                            <button type="button" onClick={() => setSelectedPayment('oxxo')} style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '8px', border: selectedPayment === 'oxxo' ? '2px solid #0c5cb3' : '1px solid #cbd5e1', backgroundColor: selectedPayment === 'oxxo' ? '#eff6ff' : 'white', fontWeight: 600, color: selectedPayment === 'oxxo' ? '#0c5cb3' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>Efectivo (OXXO Pay)</button>
                                        </div>
                                    </div>

                                    {selectedPayment === 'card' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Número de Tarjeta</label>
                                                <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Expiración</label>
                                                    <input type="text" placeholder="MM/YY" value={expDate} onChange={e=>setExpDate(e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>CVV</label>
                                                    <input type="text" placeholder="123" value={cvv} onChange={e=>setCvv(e.target.value)} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPayment === 'oxxo' && (
                                        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1.25rem', marginTop: '0.5rem' }}>
                                            <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                                Al confirmar, generaremos un código de barras o referencia numérica. Acude a la caja de la sucursal OXXO más cercana, indícale al cajero que realizarás un pago de <strong>OXXO Pay</strong> y proporciona tu código.
                                            </p>
                                        </div>
                                    )}

                                    <button type="submit" disabled={!donationAmount || (selectedPayment==='card' && (!cardNumber||!expDate||!cvv))} style={{ width: '100%', padding: '1.2em', borderRadius: '8px', background: '#0c5cb3', color: 'white', fontWeight: 700, fontSize: '1.1rem', border: 'none', marginTop: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', opacity: (!donationAmount || (selectedPayment==='card' && (!cardNumber||!expDate||!cvv))) ? 0.6 : 1 }}>
                                        Confirmar Pago Seguro de ${donationAmount}.00
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
