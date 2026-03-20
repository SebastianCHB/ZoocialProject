import api from './api';

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
  /**
   * Get list of all conversations for the authenticated user.
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  },

  /**
   * Get all messages between the authenticated user and a partner.
   * @param partnerId - id_usuario of the other person in the conversation
   */
  async getConversation(partnerId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/messages/thread/${partnerId}`);
    return response.data;
  },

  /**
   * Send a new message.
   * @param receiverId - id_usuario of the recipient
   * @param message - text content
   */
  async sendMessage(receiverId: number, message: string): Promise<Message> {
    const response = await api.post<Message>('/messages/send', {
      to_usuario: receiverId,
      content: message,
    });
    return response.data;
  },
};
