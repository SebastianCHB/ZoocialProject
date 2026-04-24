import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import {
    Settings, LogOut, Camera, UserSquare,
    ChevronRight, X, Image as ImageIcon, Trash2, Heart,
    MessageCircle, ShoppingBag
} from 'lucide-react';
import { StreakCard } from '../components/ui/StreakCard';
import { useStreak } from '../api/useStreak';
import api from '../api/axios';

function getInitials(name: string) { return name ? name.slice(0, 2).toUpperCase() : 'U'; }

import { getFullImageUrl } from '../utils/imageUrl';


export const Profile = () => {
    const { user, login, logout } = useAuth();
    const { currentStreak, maxStreak, loading: streakLoading } = useStreak();
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info');

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState(user?.nombre_completo || '');
    const [editPhone, setEditPhone] = useState(user?.telefono || '');
    const [editCity, setEditCity] = useState(user?.ciudad || '');
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);

    // Avatar
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Image viewer
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    // Confirm delete post
    const [deletePostId, setDeletePostId] = useState<number | null>(null);
    const [deletingPost, setDeletingPost] = useState(false);

    // Orders modal
    const [showOrders, setShowOrders] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoadingPosts(true);
            try {
                const [postsRes, ordersRes] = await Promise.all([
                    api.get('/posts/user'),
                    api.get('/payments/my-orders').catch(() => ({ data: [] })),
                ]);
                setMyPosts(postsRes.data);
                setMyOrders(ordersRes.data);
            } catch (error) {
                console.error("Error fetching profile data", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetch();
    }, []);

    const handleDeletePost = async () => {
        if (!deletePostId) return;
        setDeletingPost(true);
        try {
            await api.delete(`/posts/${deletePostId}`);
            setMyPosts(prev => prev.filter(p => p.id !== deletePostId));
            setDeletePostId(null);
        } catch {
            // Silently fail (no alert)
        } finally {
            setDeletingPost(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const openEdit = () => {
        setEditName(user?.nombre_completo || '');
        setEditPhone(user?.telefono || '');
        setEditCity(user?.ciudad || '');
        setEditError('');
        setEditSuccess(false);
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        setEditError('');
        try {
            const formData = new FormData();
            if (editName) formData.append('nombre_completo', editName);
            if (editPhone) formData.append('telefono', editPhone);
            if (editCity) formData.append('ciudad', editCity);
            if (avatarFile) formData.append('imagen_perfil', avatarFile);

            const res = await api.post(`/usuarios/${user.id_usuario}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update auth context
            const token = localStorage.getItem('token') || '';
            login(token, res.data?.user ?? res.data ?? user);
            setEditSuccess(true);
            setAvatarFile(null);
            setTimeout(() => { setShowEditModal(false); setEditSuccess(false); }, 1500);
        } catch (error: any) {
            setEditError(error.response?.data?.message || 'No se pudo actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const totalComments = myPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

    const avatarUrl = user && (user as any).imagen_perfil ? getFullImageUrl((user as any).imagen_perfil) : null;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ backgroundColor: '#f7f9fc' }}>
                <TopNav title="Mi Perfil" userName={user?.nombre_completo} />

                <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '5rem' }}>
                    {/* Profile Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#333' }}>Mi Perfil</h1>
                        <button onClick={openEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', display: 'flex' }}>
                            <Settings size={22} />
                        </button>
                    </div>

                    <div style={{ padding: '0 1.5rem' }}>
                        {/* Avatar & Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.75rem 0' }}>
                            <label style={{ cursor: 'pointer', position: 'relative', marginBottom: '1rem' }} onClick={() => avatarInputRef.current?.click()}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--color-accent)', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(avatarPreview || avatarUrl) ? (
                                        <img src={avatarPreview || avatarUrl || ''} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2.25rem', fontWeight: 700, color: '#b3b3b3' }}>
                                            {getInitials(user?.nombre_completo ?? '')}
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Camera size={15} />
                                </div>
                                <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
                            </label>

                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#333', margin: '0 0 0.2rem 0' }}>{user?.nombre_completo}</h2>
                            <p style={{ fontSize: '0.9rem', color: '#8e9094', margin: '0 0 0.5rem 0' }}>{user?.correo_e}</p>
                            <span style={{ backgroundColor: '#eef4fc', padding: '0.2rem 0.9rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {user?.rol || 'normal'}
                            </span>
                            {user?.ciudad && <p style={{ fontSize: '0.85rem', color: '#8e9094', marginTop: '0.3rem' }}>{user.ciudad}</p>}
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', marginBottom: '1.25rem', overflow: 'hidden' }}>
                            {[
                                { value: myPosts.length, label: 'Posts' },
                                { value: totalLikes, label: 'Likes' },
                                { value: totalComments, label: 'Comentarios' },
                            ].map((stat, i, arr) => (
                                <div key={stat.label} style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#333' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#8e9094', fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Streak Card */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <StreakCard currentStreak={currentStreak} maxStreak={maxStreak} loading={streakLoading} />
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', backgroundColor: '#f0f4f8', borderRadius: '20px', padding: '0.25rem', marginBottom: '1.25rem' }}>
                            {(['info', 'posts'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{ flex: 1, padding: '0.65rem', borderRadius: '18px', border: 'none', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? 'var(--color-accent)' : '#8e9094', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', fontFamily: 'var(--font-family)' }}
                                >
                                    {tab === 'info' ? 'Mi Cuenta' : `Mis Posts (${myPosts.length})`}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'info' ? (
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { icon: <UserSquare size={20} color="var(--color-accent)" />, label: 'Editar Perfil', bg: '#eef4fc', action: openEdit },
                                        { icon: <Camera size={20} color="#f69622" />, label: 'Foto de Perfil', bg: '#fff4e6', action: () => avatarInputRef.current?.click() },
                                        { icon: <ShoppingBag size={20} color="#2a9d8f" />, label: 'Mis Pedidos', bg: '#eefcf1', action: () => setShowOrders(true) },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={item.action}
                                            style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 0', cursor: 'pointer', fontFamily: 'var(--font-family)' }}
                                        >
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.875rem', flexShrink: 0 }}>
                                                {item.icon}
                                            </div>
                                            <span style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>{item.label}</span>
                                            <ChevronRight size={18} color="#8e9094" />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={logout}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', backgroundColor: '#fdf2f2', borderRadius: '14px', border: 'none', cursor: 'pointer', color: '#e63946', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-family)' }}
                                >
                                    <LogOut size={18} /> Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {loadingPosts ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                        <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--color-accent)' }} />
                                    </div>
                                ) : myPosts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
                                        <ImageIcon size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Aún no tienes posts.</p>
                                    </div>
                                ) : (
                                    myPosts.map(post => (
                                        <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative' }}>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333', lineHeight: 1.5, paddingRight: '2rem' }}>
                                                {post.content}
                                            </p>
                                            {post.image_url && (
                                                <div
                                                    onClick={() => setViewerImage(getFullImageUrl(post.image_url) || null)}
                                                    style={{ width: '100%', height: '140px', borderRadius: '10px', backgroundColor: '#f1f5f9', backgroundImage: `url(${getFullImageUrl(post.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}
                                                />
                                            )}
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8e9094', fontSize: '0.8rem' }}>
                                                    <Heart size={14} /> {post.likes || 0}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8e9094', fontSize: '0.8rem' }}>
                                                    <MessageCircle size={14} /> {post.comments?.length || 0}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setDeletePostId(post.id)}
                                                style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', display: 'flex', padding: 0 }}
                                            >
                                                <Trash2 size={17} />
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
                    <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
                        <div className="modal-box" style={{ maxWidth: '480px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Editar Perfil</h3>
                                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', display: 'flex' }}>
                                    <X size={22} />
                                </button>
                            </div>
                            {editError && <div className="alert-error">{editError}</div>}
                            {editSuccess && <div className="alert-success">¡Perfil actualizado correctamente!</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {[
                                    { label: 'Nombre completo', value: editName, setter: setEditName, type: 'text' },
                                    { label: 'Teléfono', value: editPhone, setter: setEditPhone, type: 'tel' },
                                    { label: 'Ciudad', value: editCity, setter: setEditCity, type: 'text' },
                                ].map(field => (
                                    <div key={field.label}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{field.label}</label>
                                        <input
                                            type={field.type}
                                            value={field.value}
                                            onChange={e => field.setter(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                ))}
                                {avatarFile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '10px' }}>
                                        <img src={avatarPreview!} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>Nueva foto seleccionada</span>
                                        <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="btn btn-primary btn-full"
                                    style={{ marginTop: '0.5rem', borderRadius: '12px', padding: '0.875rem' }}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Post Confirm */}
                {deletePostId && (
                    <div className="modal-backdrop" onClick={() => setDeletePostId(null)}>
                        <div className="modal-box" style={{ maxWidth: '340px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Trash2 size={22} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>¿Eliminar este post?</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Esta acción no se puede deshacer.</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-secondary btn-full" onClick={() => setDeletePostId(null)}>Cancelar</button>
                                <button
                                    className="btn btn-full"
                                    onClick={handleDeletePost}
                                    disabled={deletingPost}
                                    style={{ backgroundColor: '#ef4444', color: 'white', opacity: deletingPost ? 0.6 : 1 }}
                                >
                                    {deletingPost ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Orders Modal */}
                {showOrders && (
                    <div className="modal-backdrop" onClick={() => setShowOrders(false)}>
                        <div className="modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingBag size={18} color="#2a9d8f" /> Mis Pedidos
                                </h3>
                                <button onClick={() => setShowOrders(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {myOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <ShoppingBag size={36} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Aún no tienes pedidos realizados.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {myOrders.map((order: any) => (
                                        <div key={order.id} style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                                                    {order.description || 'Pedido PayPal'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {new Date(order.created_at).toLocaleDateString('es-MX')} • {order.type === 'donation' ? 'Donación' : 'Compra'}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                                                ${Number(order.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
