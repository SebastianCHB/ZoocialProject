import api from './api';

// types
export type Conversation = {
  partner: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
  latest_message: string;
  latest_at: string;
  unread_count: number;
};

// types
export type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
};

export const messagesService = {

  // conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  },

  // thread
  async getConversation(partnerId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/messages/thread/${partnerId}`);
    return response.data;
  },

  // send
  async sendMessage(receiverId: number, message: string): Promise<Message> {
    const response = await api.post<Message>('/messages/send', {
      to_usuario: receiverId,
      content: message,
    });
    return response.data;
  },
};
