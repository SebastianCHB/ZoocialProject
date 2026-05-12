import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, X, Send } from 'lucide-react';
import { PostCard } from '../components/ui/PostCard';
import { Modal as AlertModal } from '../components/ui/Modal';
import { AdComponent } from '../components/ui/AdComponent';
import api from '../api/axios';
import { getFullImageUrl } from '../utils/imageUrl';

function getAvatarColor(name: string) {
    const colors = ['#0c5cb3', '#2a9d8f', '#e76f51', '#f69622', '#6a4c93', '#457b9d'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const [profileUser, setProfileUser] = useState<any | null>(null);
    const [profilePosts, setProfilePosts] = useState<any[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'info', title: string, message: string}>({
        isOpen: false, type: 'info', title: '', message: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts');
                setPosts(res.data);
            } catch (error) {
                console.error("Error fetching posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { 
                setAlertConfig({ isOpen: true, type: 'info', title: 'Archivo muy grande', message: 'La imagen debe ser menor a 2MB.' });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() && !imageFile) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', newPost.trim());
        if (imageFile) formData.append('image', imageFile);

        try {
            const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPosts([{...res.data, usuario: { id_usuario: user?.id_usuario, nombre_completo: user?.nombre_completo, rol: user?.rol }, comments: [], likesCount: []}, ...posts]);
            setNewPost(''); setImageFile(null); setImagePreview(null); setShowCreateModal(false);
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'info', title: 'Error', message: 'Hubo un problema al publicar. Intenta de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostDeleted = (id: number) => setPosts(posts.filter(p => p.id !== id));

    const openCommentModal = (post: any) => {
        setSelectedPostId(post.id);
        setSelectedPostComments(post.comments || []);
        setShowCommentModal(true);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !selectedPostId) return;
        setSubmittingComment(true);
        try {
            const res = await api.post(`/posts/${selectedPostId}/comments`, { content: commentText.trim() });
            setSelectedPostComments([...selectedPostComments, res.data]);
            setPosts(posts.map(p => p.id === selectedPostId ? { ...p, comments: [...(p.comments||[]), res.data] } : p));
            setCommentText('');
        } catch (error) {
            setAlertConfig({ isOpen: true, type: 'info', title: 'Error', message: 'No se pudo agregar el comentario' });
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setSelectedPostComments(selectedPostComments.filter(c => c.id !== commentId));
            setPosts(posts.map(p => p.id === selectedPostId ? { ...p, comments: p.comments.filter((c:any) => c.id !== commentId) } : p));
        } catch (error) {
            console.error("Error deleting comment", error);
        }
    };

    const openUserProfile = async (u: any) => {
        setProfileUser(u);
        setLoadingProfile(true);
        try {
            await api.get(`/posts/user`); // Ideally passing ID if API supports, here we simulate filtering
            const profileRes = await api.get(`/posts`); 
            setProfilePosts(profileRes.data.filter((p:any) => p.id_usuario === u.id_usuario));
        } catch (error) {
            console.error("Error loading profile", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const name = user?.nombre_completo || 'Usuario';

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ position: 'relative' }}>
                <TopNav title="Zoocial" userName={user?.nombre_completo} />
                
                <div style={{ padding: '0 1.5rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '6rem' }}>
                    
                    {/* FEED_AVATAR_PROPAGATION - Área crear post con avatar real del usuario */}
                    <div style={{ 
                        marginTop: '1.5rem', marginBottom: '2rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', 
                        borderRadius: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                        {/* Avatar del creador: foto real si existe, sino iniciales con color */}
                        {getFullImageUrl(user?.imagen_perfil) ? (
                            <img
                                src={getFullImageUrl(user?.imagen_perfil)}
                                alt={name}
                                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: getAvatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>
                                {name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            style={{ 
                                flex: 1, textAlign: 'left', padding: '1rem 1.5rem', borderRadius: '30px', backgroundColor: '#f1f5f9', 
                                border: '1px solid #e2e8f0', color: '#64748b', fontSize: '1rem', cursor: 'pointer', outline: 'none',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e:any) => e.target.style.backgroundColor = '#e2e8f0'}
                            onMouseOut={(e:any) => e.target.style.backgroundColor = '#f1f5f9'}
                        >
                            ¿Qué está pasando con tus mascotas, {name.split(' ')[0]}?
                        </button>
                    </div>

                    {/* Posts Feed */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#0c5cb3' }}>Cargando publicaciones...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#f0f4f8', color: '#cbd5e1', marginBottom: '1rem' }}>
                                <ImageIcon size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', color: '#8e9094' }}>Sin posts. ¡Sé el primero!</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {posts.map((post, index) => (
                                <React.Fragment key={post.id}>
                                    <PostCard 
                                        post={post} 
                                        currentUser={user} 
                                        onPostDeleted={handlePostDeleted}
                                        onCommentClick={openCommentModal}
                                        onImageClick={setViewerImage}
                                        onUserClick={openUserProfile}
                                    />
                                    {(index + 1) % 3 === 0 && (
                                        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                            <AdComponent />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ 
                            width: '90%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '16px', 
                            padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#333' }}>Nuevo Post</h3>
                                <button onClick={() => { setShowCreateModal(false); setNewPost(''); setImageFile(null); setImagePreview(null); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea 
                                    className="input-field"
                                    placeholder="¿Qué está pasando con tu mascota?"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    style={{ minHeight: '120px', resize: 'none', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', fontSize: '1rem' }}
                                />
                                
                                {imagePreview && (
                                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                                        >
                                            <X size={16} />
                                        </button>
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ background: 'none', border: 'none', color: '#0c5cb3', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: '0.5rem' }}
                                    >
                                        <ImageIcon size={22} /> Imagen
                                    </button>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={fileInputRef} />
                                    
                                    <button 
                                        type="submit" 
                                        disabled={(!newPost.trim() && !imageFile) || isSubmitting}
                                        style={{ 
                                            background: '#0c5cb3', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '24px', fontWeight: 700, fontSize: '0.95rem',
                                            opacity: (!newPost.trim() && !imageFile) || isSubmitting ? 0.5 : 1, cursor: (!newPost.trim() && !imageFile) || isSubmitting ? 'default' : 'pointer'
                                        }}
                                    >
                                        {isSubmitting ? 'Publicando...' : 'Publicar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Comments Modal */}
                {showCommentModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ 
                            width: '90%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '16px', 
                            padding: '1.5rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#333' }}>Comentarios</h3>
                                <button onClick={() => { setShowCommentModal(false); setCommentText(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
                                {selectedPostComments.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#8e9094', padding: '2rem 0' }}>Sin comentarios aún.</div>
                                ) : (
                                    selectedPostComments.map(c => (
                                        <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getAvatarColor(c.usuario?.nombre_completo || 'U'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                                                {(c.usuario?.nombre_completo || 'U').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>{c.usuario?.nombre_completo || 'Usuario'}</span>
                                                    {(user?.rol === 'admin' || user?.id_usuario === c.usuario?.id_usuario) && (
                                                        <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>Eliminar</button>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.95rem', color: '#444', marginTop: '0.25rem', lineHeight: 1.4 }}>{c.content}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                                <input 
                                    className="input-field"
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Escribe un comentario..." 
                                    style={{ flex: 1, borderRadius: '24px', padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!commentText.trim() || submittingComment}
                                    style={{ 
                                        width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#0c5cb3', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        opacity: (!commentText.trim() || submittingComment) ? 0.5 : 1, cursor: (!commentText.trim() || submittingComment) ? 'default' : 'pointer'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Profile Modal */}
                {profileUser && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ 
                            width: '90%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '24px', 
                            padding: '2rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            <button onClick={() => setProfileUser(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                            
                            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: getAvatarColor(profileUser.nombre_completo), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>
                                    {profileUser.nombre_completo.substring(0, 2).toUpperCase()}
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: '0 0 0.5rem 0', textAlign: 'center' }}>{profileUser.nombre_completo}</h2>
                                {profileUser.rol && (
                                    <span style={{ backgroundColor: getAvatarColor(profileUser.rol) + '20', color: getAvatarColor(profileUser.rol), padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {profileUser.rol}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#333' }}>{profilePosts.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8e9094' }}>Posts</div>
                                </div>
                                <div style={{ width: '1px', backgroundColor: '#f0f0f0' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#333' }}>{profilePosts.reduce((a,p)=>a+(p.likes||0),0)}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8e9094' }}>Likes</div>
                                </div>
                            </div>
                            
                            {loadingProfile ? (
                                <div style={{ textAlign: 'center', color: '#0c5cb3', padding: '1rem' }}>Cargando perfil...</div>
                            ) : profilePosts.length > 0 ? (
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#333', marginBottom: '1rem' }}>Posts recientes</h4>
                                    {profilePosts.slice(0, 3).map(p => (
                                        <div key={p.id} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.content}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#8e9094', display: 'flex', gap: '0.5rem' }}>
                                                <span>❤️ {p.likes||0}</span>
                                                <span>💬 {p.comments?.length||0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#8e9094', paddingTop: '1rem' }}>No hay posts recientes.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Full Screen Image Viewer Modal */}
                {viewerImage && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button onClick={() => setViewerImage(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1001 }}>
                            <X size={36} />
                        </button>
                        <img src={viewerImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
                    </div>
                )}

                <AlertModal 
                    isOpen={alertConfig.isOpen}
                    onClose={() => setAlertConfig({...alertConfig, isOpen: false})}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                />
            </main>
        </div>
    );
};
