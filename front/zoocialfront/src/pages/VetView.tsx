import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, MapPin, PawPrint, Heart, Plus, X, Camera, RefreshCw, ClipboardList, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { getFullImageUrl } from '../utils/imageUrl';

// LEAFLET_ICON_FIX - Corregir íconos de Leaflet en Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// VET_ICON - Ícono personalizado para veterinarias
const vetIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// RECENTER_CONTROL - Componente para centrar el mapa en la posición del usuario
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => { map.setView([lat, lng], 14); }, [lat, lng]);
    return null;
};

// VET_TABS - Secciones del panel veterinario
type VetTab = 'mascotas' | 'mapa';

// VET_VIEW_PAGE - Vista exclusiva para usuarios con rol veterinario
export const VetView = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState<VetTab>('mascotas');

    // MASCOTAS_STATE
    const [pets, setPets] = useState<any[]>([]);
    const [loadingPets, setLoadingPets] = useState(true);

    // MAPA_STATE
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [vetPlaces, setVetPlaces] = useState<any[]>([]);
    const [loadingMap, setLoadingMap] = useState(false);
    const [geoError, setGeoError] = useState('');

    // ADD_PET_MODAL
    const [showAddModal, setShowAddModal] = useState(false);
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

    // FICHA_SALUD_MODAL
    const [fichaTarget, setFichaTarget] = useState<any>(null); // mascota seleccionada
    const [fichaEsterilizado, setFichaEsterilizado] = useState(false);
    const [fichaVacunas, setFichaVacunas] = useState('');
    const [fichaDesparasitado, setFichaDesparasitado] = useState(false);
    const [fichaNota, setFichaNota] = useState('');
    const [fichaSaving, setFichaSaving] = useState(false);
    const [fichaError, setFichaError] = useState('');
    const [fichaOk, setFichaOk] = useState(false);

    const fetchPets = async () => {
        setLoadingPets(true);
        try {
            const res = await api.get('/animalito');
            setPets(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch { setPets([]); }
        finally { setLoadingPets(false); }
    };

    const openFichaModal = (pet: any) => {
        const f = pet.ficha_salud ?? pet.fichaSalud;
        setFichaTarget(pet);
        setFichaEsterilizado(f ? !!f.esterilizado : false);
        setFichaVacunas(f?.vacunas ?? '');
        setFichaDesparasitado(f ? !!f.desparasitado : false);
        setFichaNota(f?.nota ?? '');
        setFichaError(''); setFichaOk(false);
    };

    const saveFicha = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fichaTarget) return;
        setFichaSaving(true); setFichaError(''); setFichaOk(false);
        const fichaId = (fichaTarget.ficha_salud ?? fichaTarget.fichaSalud)?.id_ficha;
        const payload = {
            id_animalito: fichaTarget.id_animalito,
            esterilizado: fichaEsterilizado ? 1 : 0,
            vacunas: fichaVacunas || null,
            desparasitado: fichaDesparasitado ? 1 : 0,
            nota: fichaNota || null,
        };
        try {
            if (fichaId) {
                await api.put(`/fichas-salud/${fichaId}`, payload);
            } else {
                await api.post('/fichas-salud', payload);
            }
            setFichaOk(true);
            await fetchPets();
            setTimeout(() => setFichaTarget(null), 1200);
        } catch (err: any) {
            setFichaError(err.response?.data?.message || 'Error al guardar la ficha.');
        } finally { setFichaSaving(false); }
    };

    useEffect(() => { fetchPets(); }, []);

    // GEOLOCATION_REQUEST - Pedir ubicación del usuario para centrar el mapa
    const loadMap = () => {
        if (!navigator.geolocation) {
            setGeoError('Tu navegador no soporta geolocalización.');
            return;
        }
        setLoadingMap(true);
        setGeoError('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserPos([lat, lng]);
                // OVERPASS_QUERY - Buscar veterinarias cercanas con OpenStreetMap Overpass API
                try {
                    const radius = 5000; // 5 km
                    const query = `[out:json];node["amenity"="veterinary"](around:${radius},${lat},${lng});out;`;
                    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setVetPlaces(data.elements ?? []);
                } catch { setVetPlaces([]); }
                setLoadingMap(false);
            },
            (err) => {
                setGeoError('No se pudo obtener tu ubicación. ' + err.message);
                setLoadingMap(false);
            }
        );
    };

    // HANDLE_ADD_PET
    const handleAddPet = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setAddError('');
        try {
            const formData = new FormData();
            formData.append('nombre', newName);
            formData.append('sexo', newGenero.toLowerCase());
            formData.append('estado_adopcion', 'disponible');
            formData.append('edad_estimada', newEdad);
            formData.append('especie', newEspecie);
            formData.append('raza', newRaza || 'Mestizo');
            formData.append('tamaño', newSize.toLowerCase());
            formData.append('historia', newDesc);
            if (imageFile) formData.append('imagenes[]', imageFile);
            await api.post('/animalito', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowAddModal(false);
            setNewName(''); setNewEspecie('Perro'); setNewRaza(''); setNewEdad('');
            setNewGenero('Macho'); setNewSize('Mediano'); setNewDesc('');
            setImageFile(null); setImagePreview(null);
            fetchPets();
        } catch (err: any) {
            setAddError(err.response?.data?.message || 'No se pudo agregar la mascota.');
        } finally { setSaving(false); }
    };

    const TABS: { id: VetTab; label: string; icon: React.ReactNode }[] = [
        { id: 'mascotas', label: 'Mascotas', icon: <PawPrint size={15} /> },
        { id: 'mapa', label: 'Veterinarias Cercanas', icon: <MapPin size={15} /> },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <TopNav title="Panel Veterinario" userName={user?.nombre_completo} />

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {/* VET_HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Stethoscope size={18} color="#16a34a" />
                                </div>
                                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-dark)' }}>
                                    Panel Veterinario
                                </h1>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '38px' }}>
                                Bienvenido, Dr. {user?.nombre_completo?.split(' ')[0]}
                            </p>
                        </div>
                        {tab === 'mascotas' && (
                            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                                <Plus size={16} /> Registrar Mascota
                            </button>
                        )}
                    </div>

                    {/* VET_TABS_NAV */}
                    <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9' }}>
                        {TABS.map(t => (
                            <button key={t.id} id={`vet-tab-${t.id}`} onClick={() => { setTab(t.id); if (t.id === 'mapa' && !userPos) loadMap(); }}
                                style={{
                                    padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'var(--font-family)',
                                    color: tab === t.id ? '#16a34a' : '#94a3b8',
                                    borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
                                    marginBottom: '-2px', transition: 'all 0.2s',
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB_MASCOTAS */}
                    {tab === 'mascotas' && (
                        <>
                            {loadingPets ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto', width: '36px', height: '36px', borderWidth: '4px' }} />
                                </div>
                            ) : pets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                                    <PawPrint size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                    <p style={{ fontWeight: 600 }}>No hay mascotas registradas.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                    {pets.map(pet => {
                                        const status = pet.disponibilidad ?? pet.estado_adopcion ?? 'disponible';
                                        const statusColors: Record<string, { bg: string; color: string; label: string }> = {
                                            disponible: { bg: '#f0fdf4', color: '#16a34a', label: 'Disponible' },
                                            en_proceso: { bg: '#fff7ed', color: '#ea580c', label: 'En proceso' },
                                            adoptado:   { bg: '#f8fafc', color: '#64748b', label: 'Adoptado' },
                                        };
                                        const sc = statusColors[status] ?? statusColors.disponible;
                                        const foto = pet.fotos?.[0]?.archivo;

                                        return (
                                            <div key={pet.id_animalito} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                                                {/* PET_PHOTO */}
                                                <div style={{ height: '160px', backgroundColor: '#f1f5f9', backgroundImage: foto ? `url(${getFullImageUrl(foto)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                                    {!foto && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>🐾</div>}
                                                    <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', backgroundColor: sc.bg, color: sc.color, padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>{sc.label}</span>
                                                </div>
                                                <div style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)', margin: 0 }}>{pet.nombre}</h3>
                                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>{pet.sexo ?? pet.genero ?? ''}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                                                        {pet.edad_estimado ?? pet.edad_estimada ? `${pet.edad_estimado ?? pet.edad_estimada} años` : 'Edad desconocida'}
                                                    </p>
                                                    {/* FICHA_SALUD_BADGE */}
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', backgroundColor: (pet.ficha_salud ?? pet.fichaSalud) ? '#f0fdf4' : '#fff7ed', color: (pet.ficha_salud ?? pet.fichaSalud) ? '#16a34a' : '#ea580c', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            <Stethoscope size={12} /> {(pet.ficha_salud ?? pet.fichaSalud) ? 'Ficha registrada' : 'Sin ficha'}
                                                        </span>
                                                        <button
                                                            onClick={() => openFichaModal(pet)}
                                                            style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', backgroundColor:'#eff6ff', color:'#2563eb', padding:'0.2rem 0.6rem', borderRadius:'8px', fontSize:'0.75rem', fontWeight:600, border:'none', cursor:'pointer' }}
                                                        >
                                                            <ClipboardList size={12} /> Diagnosticar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB_MAPA_VETERINARIAS */}
                    {tab === 'mapa' && (
                        <div>
                            {geoError && <div className="alert-error" style={{ marginBottom: '1rem' }}>{geoError}</div>}

                            {!userPos && !loadingMap && (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                    <MapPin size={48} color="#16a34a" style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-dark)' }}>Encuentra veterinarias cercanas</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                        Usaremos tu ubicación para mostrar clínicas veterinarias en un radio de 5 km.
                                    </p>
                                    <button id="btn-get-location" onClick={loadMap} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                                        <MapPin size={16} /> Buscar veterinarias cerca de mí
                                    </button>
                                </div>
                            )}

                            {loadingMap && (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto', width: '36px', height: '36px', borderWidth: '4px' }} />
                                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Obteniendo tu ubicación y buscando veterinarias...</p>
                                </div>
                            )}

                            {userPos && !loadingMap && (
                                <>
                                    {/* MAP_INFO_BAR */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            <MapPin size={15} color="#16a34a" />
                                            {vetPlaces.length > 0
                                                ? <span><strong style={{ color: 'var(--color-dark)' }}>{vetPlaces.length}</strong> veterinarias encontradas en 5 km</span>
                                                : <span>No se encontraron veterinarias en el área.</span>
                                            }
                                        </div>
                                        <button onClick={loadMap} className="btn btn-secondary" style={{ fontSize: '0.82rem', gap: '0.4rem' }}>
                                            <RefreshCw size={14} /> Actualizar
                                        </button>
                                    </div>

                                    {/* LEAFLET_MAP - Mapa de veterinarias */}
                                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
                                        <MapContainer center={userPos} zoom={14} style={{ height: '420px', width: '100%' }}>
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <RecenterMap lat={userPos[0]} lng={userPos[1]} />
                                            {/* USER_MARKER */}
                                            <Marker position={userPos} icon={userIcon}>
                                                <Popup><strong>Tu ubicación</strong></Popup>
                                            </Marker>
                                            {/* VET_MARKERS */}
                                            {vetPlaces.map((place: any) => (
                                                <Marker key={place.id} position={[place.lat, place.lon]} icon={vetIcon}>
                                                    <Popup>
                                                        <strong>{place.tags?.name ?? 'Veterinaria'}</strong>
                                                        {place.tags?.phone && <><br />📞 {place.tags.phone}</>}
                                                        {place.tags?.['addr:street'] && <><br />📍 {place.tags['addr:street']}</>}
                                                        <br />
                                                        <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`} target="_blank" rel="noreferrer" style={{ color: '#0056B8', fontSize: '0.8rem' }}>
                                                            Ver en Google Maps ↗
                                                        </a>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                    </div>

                                    {/* VET_LIST - Lista de veterinarias bajo el mapa */}
                                    {vetPlaces.length > 0 && (
                                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Listado</h3>
                                            {vetPlaces.slice(0, 10).map((place: any) => (
                                                <div key={place.id} className="card" style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Stethoscope size={18} color="#16a34a" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-dark)' }}>{place.tags?.name ?? 'Veterinaria'}</div>
                                                        {place.tags?.['addr:street'] && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{place.tags['addr:street']}</div>}
                                                    </div>
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '0.3rem' }}>
                                                        <Heart size={12} /> Ver
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ADD_PET_MODAL - Mismo flujo que Adoptions.tsx */}
                {/* FICHA_SALUD_MODAL */}
                {fichaTarget && (
                    <div className="modal-backdrop" onClick={() => setFichaTarget(null)}>
                        <div className="modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Stethoscope size={18} color="#16a34a" /> Ficha de Salud – {fichaTarget.nombre}
                                </h2>
                                <button onClick={() => setFichaTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={20} /></button>
                            </div>
                            {fichaOk && <div style={{ backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}><CheckCircle2 size={16} /> Ficha guardada correctamente</div>}
                            {fichaError && <div className="alert-error">{fichaError}</div>}
                            <form onSubmit={saveFicha} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={fichaEsterilizado} onChange={e => setFichaEsterilizado(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                        Esterilizado/a
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={fichaDesparasitado} onChange={e => setFichaDesparasitado(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                        Desparasitado/a
                                    </label>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Vacunas aplicadas</label>
                                    <input type="text" className="input-field" placeholder="Ej: Rabia, Parvovirus, Moquillo..." value={fichaVacunas} onChange={e => setFichaVacunas(e.target.value)} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Notas clínicas</label>
                                    <textarea className="input-field" rows={3} placeholder="Observaciones, tratamientos, historial..." value={fichaNota} onChange={e => setFichaNota(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setFichaTarget(null)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary btn-full" disabled={fichaSaving}>
                                        {fichaSaving ? 'Guardando...' : ((fichaTarget.ficha_salud ?? fichaTarget.fichaSalud) ? 'Actualizar Ficha' : 'Crear Ficha')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
                        <div className="modal-box" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Registrar Nueva Mascota</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={20} /></button>
                            </div>
                            {addError && <div className="alert-error">{addError}</div>}
                            <form onSubmit={handleAddPet} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', height: '110px', cursor: 'pointer', backgroundColor: '#f8fafc', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <><Camera size={24} color="#94a3b8" /><span>Agregar foto</span></>}
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
                                        <select className="input-field" value={newGenero} onChange={e => setNewGenero(e.target.value)}><option>Macho</option><option>Hembra</option></select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label className="input-label">Tamaño</label>
                                        <select className="input-field" value={newSize} onChange={e => setNewSize(e.target.value)}><option>Pequeño</option><option>Mediano</option><option>Grande</option></select>
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Historia / Descripción</label>
                                    <textarea className="input-field" rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Cuéntanos sobre esta mascota..." />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
                                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowAddModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Guardando...' : 'Registrar Mascota'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
