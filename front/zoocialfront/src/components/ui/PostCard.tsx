import { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import api from '../../api/axios';
import { getFullImageUrl } from '../../utils/imageUrl';

function getAvatarColor(name: string) {
    const colors = ['#0c5cb3', '#2a9d8f', '#e76f51', '#f69622', '#6a4c93', '#457b9d'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export const PostCard = ({ 
    post, 
    currentUser, 
    onPostDeleted,
    onCommentClick,
    onImageClick,
    onUserClick
}: { 
    post: any, 
    currentUser: any, 
    onPostDeleted: (id: number) => void,
    onCommentClick: (post: any) => void,
    onImageClick: (url: string) => void,
    onUserClick: (user: any) => void
}) => {
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const isLikedInitially = post.likesCount ? post.likesCount.some((l: any) => l.id_usuario === currentUser?.id_usuario) : false;
    const [liked, setLiked] = useState<boolean>(isLikedInitially);
    
    const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'info' | 'confirm', title: string, message: string, onConfirm?: () => void}>({
        isOpen: false, type: 'info', title: '', message: ''
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${post.id}/like`);
            setLikesCount(res.data.likes);
            setLiked(res.data.likedByUser);
        } catch (error) {
            console.error("Error liking post", error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        setModalConfig({
            isOpen: true,
            type: 'info',
            title: '¡Enlace copiado!',
            message: 'El enlace de esta publicación ha sido copiado a tu portapapeles.'
        });
    };

    const handleDeleteRequest = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Eliminar',
            message: '¿Estás seguro de que deseas eliminar esta publicación?',
            onConfirm: performDelete
        });
    };

    const performDelete = async () => {
        try {
            await api.delete(`/posts/${post.id}`);
            onPostDeleted(post.id);
        } catch (error) {
            console.error("Error deleting post", error);
        }
    };

    const canDelete = currentUser?.rol === 'admin' || currentUser?.id_usuario === post.usuario?.id_usuario;
    const authorName = post.usuario?.nombre_completo || 'Usuario';
    const commentsCount = post.comments?.length || 0;

    return (
        <div className="card" style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            {/* Header del post */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                    onClick={() => onUserClick(post.usuario)}
                >
                    {/* AUTHOR_AVATAR_IMG - Mostrar foto de perfil del autor si existe, sino inicial con color */}
                    {getFullImageUrl(post.usuario?.imagen_perfil) ? (
                        <img
                            src={getFullImageUrl(post.usuario?.imagen_perfil)}
                            alt={authorName}
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                objectFit: 'cover', flexShrink: 0,
                                border: `2px solid ${getAvatarColor(authorName)}`
                            }}
                            onError={(e) => {
                                // AVATAR_FALLBACK - Si la imagen falla, ocultar y CSS muestra el fondo
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div style={{ 
                            width: '38px', height: '38px', borderRadius: '50%', 
                            backgroundColor: getAvatarColor(authorName), 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: 'white', fontWeight: 'bold', fontSize: '0.9rem' 
                        }}>
                            {authorName.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#333', textTransform: 'capitalize' }}>
                            {authorName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#8e9094' }}>
                            {new Date(post.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                {canDelete && (
                    <button onClick={handleDeleteRequest} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', padding: '0.25rem' }}>
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            {/* Content matches mobile */}
            <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.5, marginBottom: '0.75rem', wordBreak: 'break-word' }}>
                {post.content}
            </div>

            {/* Media matches mobile */}
            {getFullImageUrl(post.image_url) && (
                <div 
                    style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: '#f0f0f0' }}
                    onClick={() => onImageClick(getFullImageUrl(post.image_url)!)}
                >
                    <img 
                        src={getFullImageUrl(post.image_url)} 
                        alt="Post media" 
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} 
                    />
                </div>
            )}

            {/* Actions matches mobile (no comments listed here, just the counter button) */}
            <div style={{ display: 'flex', gap: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                <button 
                    onClick={handleLike} 
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: liked ? '#e63946' : '#8e9094', cursor: 'pointer', padding: 0 }}
                >
                    <Heart size={20} fill={liked ? '#e63946' : 'none'} strokeWidth={1.5} color={liked ? '#e63946' : '#8e9094'} />
                    <span style={{ fontSize: '0.9rem', color: '#8e9094', fontWeight: 500 }}>{likesCount}</span>
                </button>
                <button 
                    onClick={() => onCommentClick(post)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8e9094', cursor: 'pointer', padding: 0 }}
                >
                    <MessageCircle size={20} strokeWidth={1.5} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{commentsCount}</span>
                </button>
                <button 
                    onClick={handleShare} 
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8e9094', cursor: 'pointer', padding: 0 }}
                >
                    <Share2 size={18} strokeWidth={1.5} />
                </button>
            </div>

            <Modal 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};
