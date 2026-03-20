import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, Camera, UserSquare, CreditCard, ChevronRight, X, Image as ImageIcon, Trash2, Heart, MessageCircle } from 'lucide-react';
import api from '../api/axios';

function getInitials(name: string) { return name ? name.slice(0, 2).toUpperCase() : 'U'; }
function getRolColor(rol: string) {
    if (rol === 'veterinario') return '#2a9d8f';
    if (rol === 'rescatista') return '#f69622';
    return '#0c5cb3';
}

export const Profile = () => {
    const { user, login, logout } = useAuth();
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    
    const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info');
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState(user?.nombre_completo || '');
    const [editPhone, setEditPhone] = useState(user?.telefono || '');
    const [editCity, setEditCity] = useState(user?.ciudad || '');
    const [saving, setSaving] = useState(false);

    // Avatar State
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Image Viewer View
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserPosts = async () => {
            setLoadingPosts(true);
            try {
                const res = await api.get('/posts/user');
                setMyPosts(res.data);
            } catch (error) {
                console.error("Error fetching user posts", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchUserPosts();
    }, []);

    const handleDeletePost = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este post?")) return;
        try {
            await api.delete(`/posts/${id}`);
            setMyPosts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting post", error);
            alert("No se pudo eliminar el post");
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('nombre_completo', editName);
            if (editPhone) formData.append('telefono', editPhone);
            if (editCity) formData.append('ciudad', editCity);

            const res = await api.post(`/usuarios/${user.id_usuario}?_method=PUT`, formData);
            // Assuming res.data contains the updated user
            login(res.data.token || localStorage.getItem('token') || '', res.data.user || res.data);
            setShowEditModal(false);
            alert("¡Perfil actualizado!");
        } catch (error) {
            console.error("Error updating profile", error);
            alert("No se pudo actualizar el perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarPreview(URL.createObjectURL(file));
            // Real implementation would upload automatically or wait for save
        }
    };

    const openEdit = () => {
        setEditName(user?.nombre_completo || '');
        setEditPhone(user?.telefono || '');
        setEditCity(user?.ciudad || '');
        setShowEditModal(true);
    };

    const getFullImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const base = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://192.168.1.40:8000';
        return `${base}/${url.startsWith('/') ? url.slice(1) : url.startsWith('storage') ? url : 'storage/' + url}`;
    };

    const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const totalComments = myPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
                <TopNav title="Mi Perfil" userName={user?.nombre_completo} />
                
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '4rem' }}>
                    
                    {/* Header like mobile */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: 'white' }}>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#333' }}>Mi Perfil</h1>
                        <button onClick={openEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}>
                            <Settings size={22} />
                        </button>
                    </div>

                    <div style={{ padding: '0 1.5rem' }}>
                        {/* Avatar & Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
                            <label style={{ cursor: 'pointer', position: 'relative', marginBottom: '1rem', display: 'block' }}>
                                <div style={{ width: '110px', height: '110px', borderRadius: '55px', backgroundColor: '#f0f0f0', border: '3px solid #0c5cb3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#b3b3b3' }}>
                                            {getInitials(user?.nombre_completo)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '32px', height: '32px', borderRadius: '16px', backgroundColor: '#0c5cb3', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Camera size={16} />
                                </div>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                            </label>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#333', margin: '0 0 0.25rem 0' }}>{user?.nombre_completo || 'Usuario'}</h2>
                            <p style={{ fontSize: '0.9rem', color: '#8e9094', margin: '0 0 0.5rem 0' }}>{user?.correo_e}</p>
                            
                            <div style={{ backgroundColor: '#eef4fc', padding: '0.25rem 1rem', borderRadius: '16px', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c5cb3', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {user?.rol || 'normal'}
                                </span>
                            </div>
                            
                            {user?.ciudad && <p style={{ fontSize: '0.9rem', color: '#8e9094', margin: '0.25rem 0 0 0' }}>{user.ciudad}</p>}
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '18px', border: '1px solid #f0f0f0', marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ flex: 1, padding: '1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#333', marginBottom: '0.25rem' }}>{myPosts.length}</div>
                                <div style={{ fontSize: '0.8rem', color: '#8e9094', fontWeight: 500 }}>Posts</div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#f0f0f0' }}></div>
                            <div style={{ flex: 1, padding: '1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#333', marginBottom: '0.25rem' }}>{totalLikes}</div>
                                <div style={{ fontSize: '0.8rem', color: '#8e9094', fontWeight: 500 }}>Likes</div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#f0f0f0' }}></div>
                            <div style={{ flex: 1, padding: '1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#333', marginBottom: '0.25rem' }}>{totalComments}</div>
                                <div style={{ fontSize: '0.8rem', color: '#8e9094', fontWeight: 500 }}>Comentarios</div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', backgroundColor: '#f0f4f8', borderRadius: '24px', padding: '0.3rem', marginBottom: '1.5rem' }}>
                            <button 
                                onClick={() => setActiveTab('info')}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: 'none', background: activeTab === 'info' ? 'white' : 'transparent', color: activeTab === 'info' ? '#0c5cb3' : '#8e9094', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: activeTab === 'info' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                            >
                                Mi Cuenta
                            </button>
                            <button 
                                onClick={() => setActiveTab('posts')}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: 'none', background: activeTab === 'posts' ? 'white' : 'transparent', color: activeTab === 'posts' ? '#0c5cb3' : '#8e9094', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: activeTab === 'posts' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                            >
                                Mis Posts ({myPosts.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'info' ? (
                            <div>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button onClick={openEdit} style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 0', cursor: 'pointer' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eef4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                                            <UserSquare size={22} color="#0c5cb3" />
                                        </div>
                                        <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 600, color: '#333' }}>Editar Perfil</span>
                                        <ChevronRight size={20} color="#8e9094" />
                                    </button>
                                    
                                    <label style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 0', cursor: 'pointer' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fff4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                                            <Camera size={22} color="#f69622" />
                                        </div>
                                        <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 600, color: '#333' }}>Foto de Perfil</span>
                                        <ChevronRight size={20} color="#8e9094" />
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                                    </label>
                                    
                                    <button style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 0', cursor: 'pointer' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eefcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                                            <CreditCard size={22} color="#2a9d8f" />
                                        </div>
                                        <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 600, color: '#333' }}>Mis Pedidos</span>
                                        <ChevronRight size={20} color="#8e9094" />
                                    </button>
                                </div>

                                <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#fdf2f2', borderRadius: '16px', border: 'none', cursor: 'pointer', color: '#e63946', fontWeight: 700, fontSize: '1rem' }}>
                                    <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {loadingPosts ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#0c5cb3' }}>
                                        <div className="spinner" style={{ borderTopColor: '#0c5cb3', width: '30px', height: '30px', borderWidth: '3px', margin: '0 auto' }}></div>
                                    </div>
                                ) : myPosts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
                                        <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>Aún no tienes posts.</p>
                                    </div>
                                ) : (
                                    myPosts.map(post => (
                                        <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'relative' }}>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#333', lineHeight: 1.5, paddingRight: '2rem' }}>
                                                {post.content}
                                            </p>
                                            {post.image_url && (
                                                <div 
                                                    onClick={() => setViewerImage(getFullImageUrl(post.image_url))}
                                                    style={{ width: '100%', height: '160px', borderRadius: '12px', backgroundColor: '#f1f5f9', backgroundImage: `url(${getFullImageUrl(post.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '0.75rem', cursor: 'pointer' }}
                                                />
                                            )}
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8e9094', fontSize: '0.85rem', fontWeight: 500 }}>
                                                    <Heart size={16} /> {post.likes || 0}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8e9094', fontSize: '0.85rem', fontWeight: 500 }}>
                                                    <MessageCircle size={16} /> {post.comments?.length || 0}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', display: 'flex', padding: 0 }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {showEditModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '1.5rem 1.5rem 2.5rem 1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#333' }}>Editar Perfil</h3>
                                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Nombre completo</label>
                                    <input 
                                        type="text" 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)} 
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #e1e1e1', outline: 'none', fontSize: '1rem', color: '#333' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Teléfono</label>
                                    <input 
                                        type="tel" 
                                        value={editPhone} 
                                        onChange={(e) => setEditPhone(e.target.value)} 
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #e1e1e1', outline: 'none', fontSize: '1rem', color: '#333' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Ciudad</label>
                                    <input 
                                        type="text" 
                                        value={editCity} 
                                        onChange={(e) => setEditCity(e.target.value)} 
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #e1e1e1', outline: 'none', fontSize: '1rem', color: '#333' }}
                                    />
                                </div>

                                <button 
                                    onClick={handleSaveProfile} 
                                    disabled={saving}
                                    style={{ width: '100%', background: '#0c5cb3', color: 'white', border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', marginTop: '1rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', justifyContent: 'center' }}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Screen Image Viewer Modal for Post Thumbs */}
                {viewerImage && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                        <button 
                            onClick={() => setViewerImage(null)}
                            style={{ position: 'absolute', top: '2rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'white', zIndex: 10 }}
                        >
                            <X size={36} />
                        </button>
                        <img src={viewerImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                    </div>
                )}
            </main>
        </div>
    );
};
