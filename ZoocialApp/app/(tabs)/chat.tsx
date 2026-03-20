import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

type User = { id_usuario: number; id?: number; nombre_completo: string; rol: string; ciudad?: string; correo_e?: string };
type Message = { id: number; from_usuario: number; to_usuario: number; content: string; created_at: string; sender?: { nombre_completo: string } };
type Conversation = User & { last_message?: string; last_message_at?: string; unread_count?: number };

function getInitials(name: string) { return name.slice(0, 2).toUpperCase(); }
function getRolColor(rol: string) {
  if (rol === 'veterinario') return '#2a9d8f';
  if (rol === 'rescatista') return '#f69622';
  return '#0c5cb3';
}

export default function ChatScreen() {
  const { user: me } = useAuth();
  const [view, setView] = useState<'list' | 'thread' | 'users'>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useFocusEffect(useCallback(() => {
    if (view === 'list') loadConversations();
  }, [view]));

  async function loadConversations() {
    setLoading(true);
    try {
      const convRes = await api.get('/messages/conversations');
      setConversations(convRes.data);
    } catch (e) {
      console.error('Error loading conversations:', e);
    }

    try {
      const usersRes = await api.get('/usuarios');
      const otherUsers = usersRes.data.filter((u: User) => {
        const myId = me?.id_usuario || me?.id; // Support both naming conventions
        const userId = u.id_usuario || u.id;
        return userId !== myId;
      });
      setAllUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (e) {
      console.error('Error loading users:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadThread(user: User) {
    setSelectedUser(user);
    setView('thread');
    setLoading(true);
    try {
      const res = await api.get(`/messages/thread/${user.id_usuario}`);
      setMessages(res.data);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    } catch { } finally { setLoading(false); }
  }

  useEffect(() => {
    if (view !== 'thread' || !selectedUser) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/messages/thread/${selectedUser.id_usuario}`);
        const newMessages: Message[] = res.data;
        setMessages(prev => {
          if (newMessages.length > prev.length) {
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
          }
          return newMessages;
        });
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, [view, selectedUser]);

  async function sendMessage() {
    if (!messageText.trim() || !selectedUser) return;
    setSending(true);
    const text = messageText.trim();
    setMessageText('');
    try {
      const res = await api.post('/messages/send', { to_usuario: selectedUser.id_usuario, content: text });
      setMessages(prev => [...prev, res.data]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { } finally { setSending(false); }
  }

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilteredUsers(allUsers.filter(u => u.nombre_completo.toLowerCase().includes(text.toLowerCase())));
  };

  const threadModal = (
    <Modal
      visible={view === 'thread' && !!selectedUser}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => { setView('list'); loadConversations(); }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setView('list'); loadConversations(); }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          {selectedUser && (
            <View style={styles.headerUser}>
              <View style={[styles.avatarSmall, { backgroundColor: getRolColor(selectedUser.rol) }]}>
                <Text style={styles.avatarSmallText}>{getInitials(selectedUser.nombre_completo)}</Text>
              </View>
              <View>
                <Text style={styles.headerName}>{selectedUser.nombre_completo}</Text>
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.headerRole}>{selectedUser.rol} · activo</Text>
                </View>
              </View>
            </View>
          )}
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator size="large" color="#0c5cb3" /></View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => String(m.id)}
            contentContainerStyle={styles.messageList}
            ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>Sé el primero en escribir 👋</Text></View>}
            renderItem={({ item }) => {
              const myId = me?.id_usuario || me?.id;
              const isMe = item.from_usuario === myId;
              return (
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
                  <Text style={[styles.bubbleTime, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
                    {new Date(item.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#aaa"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!messageText.trim() || sending) && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ── Users list to start new chat
  if (view === 'users') {
    return (
      <View style={styles.container}>
        {threadModal}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('list')}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Conversación</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#aaa" style={{ marginRight: 8 }} />
          <TextInput style={styles.searchInput} placeholder="Buscar usuario..." placeholderTextColor="#aaa" value={search} onChangeText={handleSearch} />
        </View>
        <FlatList
          data={filteredUsers}
          keyExtractor={u => String(u.id_usuario)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userCard} onPress={() => loadThread(item)}>
              <View style={[styles.avatar, { backgroundColor: getRolColor(item.rol) }]}>
                <Text style={styles.avatarText}>{getInitials(item.nombre_completo)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.nombre_completo}</Text>
                <Text style={styles.userSub}>{item.rol} {item.ciudad ? `· ${item.ciudad}` : ''}</Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0c5cb3" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ── Conversations list
  return (
    <View style={styles.container}>
      {threadModal}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => { setSearch(''); setView('users'); }}>
          <Ionicons name="create-outline" size={22} color="#0c5cb3" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#0c5cb3" /></View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={c => String(c.id_usuario)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={56} color="#ddd" />
              <Text style={styles.emptyText}>Sin conversaciones todavía.</Text>
              <TouchableOpacity style={styles.newChatBtnLarge} onPress={() => setView('users')}>
                <Text style={styles.newChatBtnText}>Iniciar chat</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convCard} onPress={() => loadThread(item)}>
              <View style={[styles.avatar, { backgroundColor: getRolColor(item.rol) }]}>
                <Text style={styles.avatarText}>{getInitials(item.nombre_completo)}</Text>
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convName}>{item.nombre_completo}</Text>
                <Text style={styles.convLast} numberOfLines={1}>{item.last_message || 'Sin mensajes'}</Text>
              </View>
              {(item.unread_count ?? 0) > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{item.unread_count}</Text></View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 12 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#333' },
  headerRole: { fontSize: 12, color: '#8e9094', textTransform: 'capitalize' },
  newChatBtn: { padding: 6 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    paddingHorizontal: 14, height: 46,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarSmallText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 18, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#333' },
  userSub: { fontSize: 13, color: '#8e9094', textTransform: 'capitalize', marginTop: 2 },
  convCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 18, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 3 },
  convLast: { fontSize: 13, color: '#8e9094' },
  badge: {
    backgroundColor: '#0c5cb3', width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#aaa', marginTop: 10, fontSize: 14 },
  newChatBtnLarge: {
    marginTop: 20, backgroundColor: '#0c5cb3',
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20,
  },
  newChatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  messageList: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 100 },
  bubble: {
    maxWidth: '75%', padding: 12, borderRadius: 18, marginBottom: 8,
  },
  bubbleMe: {
    alignSelf: 'flex-end', backgroundColor: '#0c5cb3',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  bubbleText: { fontSize: 15, color: '#333', lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#8e9094', marginTop: 4, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1, borderWidth: 1, borderColor: '#e1e1e1', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#0c5cb3', width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2a9d8f' },
});

