import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, Modal, ActivityIndicator, Alert,
  RefreshControl, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { postService, Post, Comment } from '@/services/posts';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';
import { getFullImageUrl } from '@/utils/imageUtils';

type Publicidad = { id_publicidad: number; texto?: string; archivo?: string; duracion?: number };
type UserProfile = { id_usuario: number; nombre_completo: string; rol: string; ciudad?: string; correo_e?: string };


function getInitials(name: string) { return (name || 'U').slice(0, 2).toUpperCase(); }
function getAvatarColor(name: string) {
  const colors = ['#0c5cb3', '#2a9d8f', '#e76f51', '#f69622', '#6a4c93', '#457b9d'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function UserAvatar({ name, size = 40, onPress }: { name: string; size?: number; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: getAvatarColor(name) }]}
      disabled={!onPress}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.37 }]}>{getInitials(name)}</Text>
    </TouchableOpacity>
  );
}

type PostCardFullProps = {
  post: Post;
  currentUserId: number;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onComment: (id: number) => void;
  onImagePress: (uri: string) => void;
  onUserPress: (userId: number, name: string) => void;
};

function PostCardFull({ post, currentUserId, onLike, onDelete, onComment, onImagePress, onUserPress }: PostCardFullProps) {
  const isOwner = post.id_usuario === currentUserId;
  const name = post.usuario?.nombre_completo || 'Usuario';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.authorRow} onPress={() => onUserPress(post.id_usuario, name)} activeOpacity={0.8}>
          <UserAvatar name={name} size={38} />
          <View>
            <Text style={styles.authorName}>{name}</Text>
            <Text style={styles.authorSub}>
              {new Date(post.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={() => Alert.alert('Eliminar', '¿Eliminar este post?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(post.id) }
          ])}>
            <Ionicons name="trash-outline" size={20} color="#e63946" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {getFullImageUrl(post.image_url) ? (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(getFullImageUrl(post.image_url)!)}>
          <Image source={{ uri: getFullImageUrl(post.image_url) }} style={styles.postImage} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons name={post.liked_by_user ? 'heart' : 'heart-outline'} size={22} color={post.liked_by_user ? '#e63946' : '#8e9094'} />
          <Text style={styles.actionCount}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#8e9094" />
          <Text style={styles.actionCount}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color="#8e9094" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AdBanner({ ads }: { ads: Publicidad[] }) {
  if (!ads.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adScroll}>
      {ads.map(ad => (
        <View key={String(ad.id_publicidad)} style={styles.adCard}>
          <Ionicons name="megaphone-outline" size={22} color="#f69622" />
          <Text style={styles.adText} numberOfLines={2}>{ad.texto || 'Publicidad'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Publicidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | undefined>();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  async function loadAll() {
    try {
      const [postsData, adsData] = await Promise.all([
        postService.getFeed(),
        api.get('/publicidad').then(r => r.data).catch(() => []),
      ]);
      setPosts(postsData);
      setAds(adsData);
    } catch (e) { console.error(e); } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  useEffect(() => { loadAll(); }, []);
  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const handleLike = async (id: number) => {
    try {
      const result = await postService.toggleLike(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: result.likes, liked_by_user: result.likedByUser } : p));
    } catch { Alert.alert('Error', 'No se pudo procesar el like'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await postService.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { Alert.alert('Error', 'No se pudo eliminar el post'); }
  };

  const handleOpenComment = (id: number) => {
    const post = posts.find(p => p.id === id);
    setSelectedPostId(id);
    setSelectedPostComments(post?.comments || []);
    setShowCommentModal(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPostId) return;
    setSubmitting(true);
    try {
      const comment = await postService.addComment(selectedPostId, commentText.trim());
      setSelectedPostComments(prev => [...prev, comment]);
      setPosts(prev => prev.map(p => p.id === selectedPostId ? { ...p, comments: [...(p.comments || []), comment] } : p));
      setCommentText('');
    } catch { Alert.alert('Error', 'No se pudo agregar el comentario'); }
    finally { setSubmitting(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) setNewPostImage(result.assets[0].uri);
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    setSubmitting(true);
    try {
      const post = await postService.create(newPostText.trim(), newPostImage);
      setPosts(prev => [post, ...prev]);
      setNewPostText(''); setNewPostImage(undefined); setShowCreateModal(false);
    } catch { Alert.alert('Error', 'No se pudo publicar el post'); }
    finally { setSubmitting(false); }
  };

  const openUserProfile = async (userId: number, name: string) => {
    setLoadingProfile(true);
    setProfileUser({ id_usuario: userId, nombre_completo: name, rol: '' });
    try {
      const [userRes] = await Promise.all([
        api.get(`/usuarios/${userId}`),
      ]);
      setProfileUser(userRes.data);
      setProfilePosts(posts.filter(p => p.id_usuario === userId));
    } catch { } finally { setLoadingProfile(false); }
  };

  const name = user?.nombre_completo || 'Usuario';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="paw" size={26} color="#0c5cb3" />
          <Text style={styles.logoText}>Zoocial</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="notifications-outline" size={24} color="#f69622" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#0c5cb3" /></View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0c5cb3']} />}
          ListHeaderComponent={
            <>
              <View style={styles.greetingCard}>
                <UserAvatar name={name} size={40} />
                <View>
                  <Text style={styles.welcome}>¡Bienvenido de nuevo!</Text>
                  <Text style={styles.userName}>{name}</Text>
                </View>
              </View>
              <AdBanner ads={ads} />
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={56} color="#ddd" />
              <Text style={styles.emptyText}>Sin posts. ¡Sé el primero!</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <>
              <PostCardFull
                post={item}
                currentUserId={user?.id_usuario ?? -1}
                onLike={handleLike}
                onDelete={handleDelete}
                onComment={handleOpenComment}
                onImagePress={setViewerImage}
                onUserPress={openUserProfile}
              />
              {(index + 1) % 3 === 0 && ads.length > 0 && (
                <View style={styles.feedAdContainer}>
                  <View style={styles.adCardFeed}>
                    <Ionicons name="megaphone-outline" size={24} color="#f69622" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adFeedTitle}>PATROCINADO</Text>
                      <Text style={styles.adFeedText} numberOfLines={2}>
                        {ads[Math.floor(index / 3) % ads.length]?.texto || 'Publicidad'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Full Screen Image Viewer */}
      <Modal visible={!!viewerImage} transparent animationType="fade" onRequestClose={() => setViewerImage(null)}>
        <View style={styles.imageViewer}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewerImage(null)}>
            <Ionicons name="close-circle" size={38} color="#fff" />
          </TouchableOpacity>
          {viewerImage && <Image source={{ uri: viewerImage }} style={styles.imageViewerImg} resizeMode="contain" />}
        </View>
      </Modal>

      {/* User Profile Modal */}
      <Modal visible={!!profileUser} animationType="slide" transparent onRequestClose={() => setProfileUser(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setProfileUser(null)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            {loadingProfile ? (
              <ActivityIndicator size="large" color="#0c5cb3" style={{ margin: 40 }} />
            ) : profileUser && (
              <ScrollView>
                <View style={styles.profileModalHeader}>
                  <UserAvatar name={profileUser.nombre_completo} size={70} />
                  <Text style={styles.profileModalName}>{profileUser.nombre_completo}</Text>
                  {profileUser.rol ? (
                    <View style={[styles.roleBadge, { backgroundColor: getAvatarColor(profileUser.rol) + '22' }]}>
                      <Text style={[styles.roleText, { color: getAvatarColor(profileUser.rol) }]}>{profileUser.rol.toUpperCase()}</Text>
                    </View>
                  ) : null}
                  {profileUser.ciudad ? <Text style={styles.profileCity}>{profileUser.ciudad}</Text> : null}
                </View>
                <View style={styles.profileStats}>
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatNum}>{profilePosts.length}</Text>
                    <Text style={styles.profileStatLabel}>Posts</Text>
                  </View>
                  <View style={[styles.profileStat, styles.profileStatBorder]}>
                    <Text style={styles.profileStatNum}>{profilePosts.reduce((a, p) => a + p.likes, 0)}</Text>
                    <Text style={styles.profileStatLabel}>Likes</Text>
                  </View>
                </View>
                {profilePosts.length > 0 && (
                  <>
                    <Text style={styles.profileSectionTitle}>Posts recientes</Text>
                    {profilePosts.slice(0, 3).map(p => (
                      <View key={p.id} style={styles.profilePostItem}>
                        <Text style={styles.profilePostText} numberOfLines={2}>{p.content}</Text>
                        <Text style={styles.profilePostMeta}>❤️ {p.likes} · 💬 {p.comments?.length || 0}</Text>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Post</Text>
              <TouchableOpacity onPress={() => { setShowCreateModal(false); setNewPostText(''); setNewPostImage(undefined); }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="¿Qué está pasando con tu mascota?"
              placeholderTextColor="#aaa"
              multiline
              value={newPostText}
              onChangeText={setNewPostText}
            />
            {newPostImage && <Image source={{ uri: newPostImage }} style={styles.previewImage} resizeMode="cover" />}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color="#0c5cb3" />
                <Text style={styles.imagePickerText}>Imagen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, (!newPostText.trim() || submitting) && styles.submitBtnDisabled]}
                onPress={handleCreatePost}
                disabled={!newPostText.trim() || submitting}
              >
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Publicar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={() => { setShowCommentModal(false); setCommentText(''); }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedPostComments}
              keyExtractor={c => String(c.id)}
              style={styles.commentList}
              ListEmptyComponent={<Text style={styles.emptyText}>Sin comentarios aún.</Text>}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <UserAvatar name={item.usuario?.nombre_completo || 'U'} size={30} />
                  <View style={styles.commentBody}>
                    <Text style={styles.commentAuthor}>{item.usuario?.nombre_completo || 'Usuario'}</Text>
                    <Text style={styles.commentContent}>{item.content}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14, backgroundColor: '#fff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#0c5cb3' },
  headerAction: { marginLeft: 12, position: 'relative' },
  notifDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#e63946' },
  avatar: { justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 150 },
  greetingCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 16, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  welcome: { fontSize: 12, color: '#8e9094' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  // Ads
  adScroll: { paddingVertical: 4, paddingBottom: 8, gap: 10 },
  adCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff8ee', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#fde5b8', minWidth: 220,
  },
  adText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  feedAdContainer: { paddingHorizontal: 16, marginTop: 12 },
  adCardFeed: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fffcf5', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#f69622', borderStyle: 'dashed',
    shadowColor: '#f69622', shadowOpacity: 0.1, shadowRadius: 10, elevation: 1,
  },
  adFeedTitle: { fontSize: 11, fontWeight: 'bold', color: '#f69622', letterSpacing: 1, marginBottom: 2 },
  adFeedText: { fontSize: 14, color: '#444', lineHeight: 20 },
  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#333' },
  authorSub: { fontSize: 12, color: '#8e9094' },
  content: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, color: '#8e9094' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 110, right: 24,
    width: 58, height: 58, borderRadius: 29, backgroundColor: '#f69622',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#f69622', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 8,
  },
  // Image viewer
  imageViewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imageViewerClose: { position: 'absolute', top: 56, right: 20, zIndex: 10 },
  imageViewerImg: { width: '100%', height: '80%' },
  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 36, maxHeight: '82%',
  },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  postInput: {
    borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 14,
    padding: 14, fontSize: 15, color: '#333', minHeight: 100, textAlignVertical: 'top', marginBottom: 12,
  },
  previewImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  imagePickerText: { color: '#0c5cb3', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#0c5cb3', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  commentList: { maxHeight: 300, marginBottom: 12 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 2 },
  commentContent: { fontSize: 14, color: '#555', lineHeight: 20 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentInput: {
    flex: 1, borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#333',
  },
  commentSendBtn: {
    backgroundColor: '#0c5cb3', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  // User Profile modal
  profileModalHeader: { alignItems: 'center', paddingTop: 30, paddingBottom: 16 },
  profileModalName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  roleBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 4 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  profileCity: { fontSize: 13, color: '#8e9094', marginTop: 2 },
  profileStats: { flexDirection: 'row', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 16, marginHorizontal: 20, marginBottom: 20 },
  profileStat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  profileStatBorder: { borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
  profileStatNum: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  profileStatLabel: { fontSize: 12, color: '#8e9094' },
  profileSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, marginBottom: 10 },
  profilePostItem: { backgroundColor: '#f7f9fc', borderRadius: 12, padding: 12, marginHorizontal: 20, marginBottom: 8 },
  profilePostText: { fontSize: 14, color: '#333', marginBottom: 6, lineHeight: 20 },
  profilePostMeta: { fontSize: 12, color: '#8e9094' },
});
