import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { TopNav } from '../components/ui/TopNav';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Search, Edit, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

function getInitials(name: string) { return name ? name.slice(0, 2).toUpperCase() : 'U'; }
function getRolColor(rol: string) {
    if (rol === 'veterinario') return '#2a9d8f';
    if (rol === 'rescatista') return '#f69622';
    return '#0c5cb3';
}

export const Chat = () => {
    const { user: me } = useAuth();
    const [view, setView] = useState<'list' | 'users'>('list'); // Left panel view
    const [conversations, setConversations] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingInterval = useRef<any>(null);

    useEffect(() => {
        if (view === 'list') {
            loadConversations();
        } else {
            loadAllUsers();
        }
    }, [view]);

    // Handle initial auth load if necessary
    useEffect(() => {
        if (!me) return;
        loadConversations();
    }, [me]);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error("Error fetching conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/usuarios');
            const otherUsers = res.data.filter((u: any) => u.id_usuario !== me?.id_usuario);
            setAllUsers(otherUsers);
            setFilteredUsers(otherUsers);
        } catch (error) {
            console.error("Error fetching all users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        setFilteredUsers(allUsers.filter(u => u.nombre_completo?.toLowerCase().includes(text.toLowerCase())));
    };

    const loadThread = async (partner: any) => {
        setActiveConversation(partner);
        setLoading(true);
        try {
            const res = await api.get(`/messages/thread/${partner.id_usuario}`);
            setMessages(res.data);
            scrollToBottom();
            
            // Re-fetch conversations slightly delayed to clear unread counts
            setTimeout(() => {
                if(view === 'list') loadConversations();
            }, 1000);
        } catch (error) {
            console.error("Error fetching messages", error);
        } finally {
            setLoading(false);
        }
    };

    // Real-time polling
    useEffect(() => {
        if (!activeConversation) {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            return;
        }

        pollingInterval.current = setInterval(async () => {
            try {
                const res = await api.get(`/messages/thread/${activeConversation.id_usuario}`);
                const newMessages = res.data;
                setMessages(prev => {
                    if (newMessages.length > prev.length) {
                        setTimeout(() => scrollToBottom('smooth'), 100);
                    }
                    return newMessages;
                });
            } catch (e) {}
        }, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [activeConversation]);

    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        setSending(true);
        const textToSend = newMessage.trim();
        setNewMessage(''); // optimistic clear
        
        try {
            const res = await api.post('/messages/send', {
                to_usuario: activeConversation.id_usuario,
                content: textToSend
            });
            setMessages(prev => [...prev, res.data]);
            scrollToBottom('smooth');
            
            if (view === 'list') {
                loadConversations();
            }
        } catch (error) {
            console.error("Error sending message", error);
            setNewMessage(textToSend); // restore on error
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <TopNav title="Mensajes Directos" userName={me?.nombre_completo} />
                
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    
                    {/* Left Sidebar - conversations or users */}
                    <div style={{ width: '380px', borderRight: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                        {view === 'list' ? (
                            <>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#333', margin: 0 }}>Mensajes</h2>
                                    <button 
                                        onClick={() => setView('users')}
                                        style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0c5cb3' }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                                
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {loading && conversations.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando...</div>
                                    ) : conversations.length === 0 ? (
                                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <div>No tienes conversaciones todavía.</div>
                                            <button 
                                                onClick={() => setView('users')}
                                                style={{ marginTop: '1rem', background: '#0c5cb3', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Iniciar chat
                                            </button>
                                        </div>
                                    ) : (
                                        conversations.map(conv => (
                                            <div 
                                                key={conv.id_usuario}
                                                onClick={() => loadThread(conv)}
                                                style={{ 
                                                    padding: '1rem 1.5rem', 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    gap: '1rem', 
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f8fafc',
                                                    backgroundColor: activeConversation?.id_usuario === conv.id_usuario ? '#eff6ff' : 'transparent',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <div style={{ width: '50px', height: '50px', borderRadius: '25px', backgroundColor: getRolColor(conv.rol), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    {getInitials(conv.nombre_completo)}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 700, color: '#333', textTransform: 'capitalize', fontSize: '1rem' }}>
                                                            {conv.nombre_completo}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                                                            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: (conv.unread_count > 0) ? '#333' : '#64748b', fontWeight: (conv.unread_count > 0) ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {conv.last_message || 'Sin mensajes'}
                                                    </div>
                                                </div>
                                                {(conv.unread_count > 0) && (
                                                    <div style={{ backgroundColor: '#0c5cb3', color: 'white', borderRadius: '12px', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', padding: '0 8px', fontWeight: 800 }}>
                                                        {conv.unread_count}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button 
                                        onClick={() => setView('list')}
                                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#333', margin: 0 }}>Nueva Conversación</h2>
                                </div>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem 1rem' }}>
                                        <Search size={18} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar usuario..." 
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.95rem', color: '#333' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {loading && allUsers.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando usuarios...</div>
                                    ) : filteredUsers.map(u => (
                                        <div 
                                            key={u.id_usuario}
                                            onClick={() => loadThread(u)}
                                            style={{ 
                                                padding: '1rem 1.5rem', 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: '1rem', 
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f8fafc',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ width: '44px', height: '44px', borderRadius: '22px', backgroundColor: getRolColor(u.rol), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                                {getInitials(u.nombre_completo)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: '#333', textTransform: 'capitalize', fontSize: '0.95rem' }}>
                                                    {u.nombre_completo}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#8e9094', textTransform: 'capitalize' }}>
                                                    {u.rol} {u.ciudad ? `· ${u.ciudad}` : ''}
                                                </div>
                                            </div>
                                            <MessageCircle size={20} color="#0c5cb3" style={{ opacity: 0.5 }} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f7f9fc' }}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div style={{ padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', height: '76px' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '21px', backgroundColor: getRolColor(activeConversation.rol), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                                        {getInitials(activeConversation.nombre_completo)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#333', textTransform: 'capitalize', fontSize: '1.1rem' }}>{activeConversation.nombre_completo}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#2a9d8f' }}></div>
                                            <span style={{ fontSize: '0.8rem', color: '#8e9094', textTransform: 'capitalize' }}>{activeConversation.rol} · activo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {loading && messages.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0c5cb3' }}>
                                            <div className="spinner" style={{ borderTopColor: '#0c5cb3', width: '30px', height: '30px', borderWidth: '3px' }}></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                                            Sé el primero en escribir 👋
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isMine = msg.from_usuario === me?.id_usuario;
                                            return (
                                                <div key={index} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{ 
                                                        maxWidth: '75%', 
                                                        padding: '0.8rem 1rem', 
                                                        borderRadius: '18px', 
                                                        borderBottomRightRadius: isMine ? '4px' : '18px',
                                                        borderBottomLeftRadius: !isMine ? '4px' : '18px',
                                                        backgroundColor: isMine ? '#0c5cb3' : 'white',
                                                        color: isMine ? 'white' : '#334155',
                                                        boxShadow: isMine ? 'none' : '0 2px 6px rgba(0,0,0,0.04)'
                                                    }}>
                                                        <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>{msg.content}</div>
                                                        <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', textAlign: 'right', opacity: isMine ? 0.8 : 0.5, fontWeight: 500 }}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} style={{ height: 1 }} />
                                </div>

                                {/* Input Area */}
                                <div style={{ padding: '1.5rem 2rem', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
                                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                        <textarea 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder="Escribe un mensaje..." 
                                            style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '24px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.95rem', alignSelf: 'center', maxHeight: '100px' }}
                                            rows={1}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim() || sending}
                                            style={{ 
                                                width: '46px', height: '46px', borderRadius: '23px', backgroundColor: '#0c5cb3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: (newMessage.trim() && !sending) ? 'pointer' : 'default', opacity: (newMessage.trim() && !sending) ? 1 : 0.5, flexShrink: 0
                                            }}
                                        >
                                            {sending ? (
                                                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }}></div>
                                            ) : (
                                                <Send size={18} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', backgroundColor: '#f8fafc' }}>
                                <MessageCircle size={72} strokeWidth={1} style={{ marginBottom: '1.5rem', color: '#cbd5e1' }} />
                                <h2 style={{ color: '#333', marginBottom: '0.5rem', fontWeight: 700 }}>Tus Mensajes</h2>
                                <p style={{ fontSize: '0.95rem', color: '#8e9094' }}>Selecciona una conversación o inicia una nueva para chatear.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};
