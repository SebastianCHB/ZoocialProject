import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import { postService, Post } from '@/services/posts';

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [viewerImage, setViewerImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoadingPosts(true);
      postService.getMyPosts()
        .then(setMyPosts)
        .catch(() => { })
        .finally(() => setLoadingPosts(false));
    }, [])
  );

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
    }
  };

  const handleDeletePost = (id: number) => {
    Alert.alert('Eliminar post', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await postService.delete(id);
            setMyPosts(prev => prev.filter(p => p.id !== id));
          } catch { Alert.alert('Error', 'No se pudo eliminar el post'); }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await authService.updateUser(user.id_usuario, {
        nombre_completo: editName,
        telefono: editPhone || null,
        ciudad: editCity || null,
      });
      updateUser(updated);
      setShowEditModal(false);
      Alert.alert('¡Listo!', 'Perfil actualizado');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally { setSaving(false); }
  };

  const openEdit = () => {
    setEditName(user?.nombre_completo || '');
    setEditPhone(user?.telefono || '');
    setEditCity(user?.ciudad || '');
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={openEdit}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.profileInfo}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={50} color="#b3b3b3" />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.nombre_completo || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.correo_e}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{(user?.rol || 'normal').toUpperCase()}</Text>
          </View>
          {user?.ciudad ? <Text style={styles.city}>{user.ciudad}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNumber}>{myPosts.reduce((a, p) => a + p.likes, 0)}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myPosts.reduce((a, p) => a + (p.comments?.length || 0), 0)}</Text>
            <Text style={styles.statLabel}>Comentarios</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'info' && styles.tabBtnActive]} onPress={() => setActiveTab('info')}>
            <Text style={[styles.tabBtnText, activeTab === 'info' && styles.tabBtnTextActive]}>Mi Cuenta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]} onPress={() => setActiveTab('posts')}>
            <Text style={[styles.tabBtnText, activeTab === 'posts' && styles.tabBtnTextActive]}>Mis Posts ({myPosts.length})</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'info' ? (
          <>
            <View style={styles.section}>
              <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
                <View style={[styles.menuIconBox, { backgroundColor: '#eef4fc' }]}>
                  <Ionicons name="person-circle-outline" size={22} color="#0c5cb3" />
                </View>
                <Text style={styles.menuText}>Editar Perfil</Text>
                <Ionicons name="chevron-forward" size={20} color="#8e9094" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={pickAvatar}>
                <View style={[styles.menuIconBox, { backgroundColor: '#fff4e6' }]}>
                  <Ionicons name="camera-outline" size={22} color="#f69622" />
                </View>
                <Text style={styles.menuText}>Foto de Perfil</Text>
                <Ionicons name="chevron-forward" size={20} color="#8e9094" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIconBox, { backgroundColor: '#eefcf1' }]}>
                  <Ionicons name="card-outline" size={22} color="#2a9d8f" />
                </View>
                <Text style={styles.menuText}>Mis Pedidos</Text>
                <Ionicons name="chevron-forward" size={20} color="#8e9094" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
              <Ionicons name="log-out-outline" size={20} color="#e63946" />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.postsSection}>
            {loadingPosts ? (
              <ActivityIndicator color="#0c5cb3" style={{ marginTop: 20 }} />
            ) : myPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="newspaper-outline" size={50} color="#ddd" />
                <Text style={styles.emptyText}>Aún no tienes posts.</Text>
              </View>
            ) : (
              myPosts.map(post => (
                <View key={post.id} style={styles.postItem}>
                  <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
                  {post.image_url ? (
                    <TouchableOpacity onPress={() => setViewerImage(post.image_url!)}>
                      <Image source={{ uri: post.image_url }} style={styles.postThumb} resizeMode="cover" />
                    </TouchableOpacity>
                  ) : null}
                  <View style={styles.postStats}>
                    <Text style={styles.postStat}>❤️ {post.likes}</Text>
                    <Text style={styles.postStat}>💬 {post.comments?.length || 0}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(post.id)}>
                    <Ionicons name="trash-outline" size={18} color="#e63946" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <TextInput style={styles.fieldInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ciudad</Text>
              <TextInput style={styles.fieldInput} value={editCity} onChangeText={setEditCity} />
            </View>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      <Modal visible={!!viewerImage} transparent animationType="fade" onRequestClose={() => setViewerImage(null)}>
        <View style={styles.imageViewer}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewerImage(null)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {viewerImage && (
            <Image source={{ uri: viewerImage }} style={styles.imageViewerImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 58, paddingBottom: 10, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 130 },
  profileInfo: { alignItems: 'center', paddingVertical: 24 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#0c5cb3', marginBottom: 12, position: 'relative',
    overflow: 'visible',
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#0c5cb3', width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  email: { fontSize: 13, color: '#8e9094', marginBottom: 8 },
  roleBadge: { backgroundColor: '#eef4fc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 4 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#0c5cb3', letterSpacing: 1 },
  city: { fontSize: 13, color: '#8e9094', marginTop: 4 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, marginBottom: 20,
    borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#8e9094' },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#f0f4f8', borderRadius: 20,
    padding: 4, marginBottom: 20,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 14, color: '#8e9094', fontWeight: '600' },
  tabBtnTextActive: { color: '#0c5cb3' },
  section: { marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  menuIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fdf2f2', paddingVertical: 16, borderRadius: 16, marginTop: 4,
  },
  logoutText: { marginLeft: 8, color: '#e63946', fontWeight: 'bold', fontSize: 16 },
  postsSection: { gap: 12 },
  postItem: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, position: 'relative',
  },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8, paddingRight: 30 },
  postThumb: { width: '100%', height: 140, borderRadius: 10, marginBottom: 8 },
  postStats: { flexDirection: 'row', gap: 14 },
  postStat: { fontSize: 13, color: '#8e9094' },
  deleteBtn: { position: 'absolute', top: 12, right: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 14 },
  // Edit Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#8e9094', fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#333',
  },
  saveBtn: { backgroundColor: '#0c5cb3', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Image Viewer
  imageViewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imageViewerClose: { position: 'absolute', top: 56, right: 20, zIndex: 10 },
  imageViewerImg: { width: '100%', height: '80%' },
});
