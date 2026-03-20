import api from './api';

export type User = {
  id_usuario: number;
  nombre_completo: string;
  correo_e: string;
  telefono: string | null;
  ciudad: string | null;
  fecha_registro: string;
  rol: string;
  edad: number | null;
};

export type LoginResponse = {
  user: User;
  access_token: string;
  token_type: string;
};

export const authService = {
  async login(correo_e: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', {
      correo_e,
      password,
    });
    return response.data;
  },

  async register(data: { correo_e: string; password: string; nombre_completo: string; rol?: string; edad?: number }): Promise<User> {
    // Note: Adjusting slightly according to the API controller expectations
    const response = await api.post<User>('/usuarios', {
      ...data,
      // Default to "normal" if role is not passed yet
      rol: data.rol || 'normal'
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async getUser(): Promise<User> {
    const response = await api.get<User>('/user');
    return response.data;
  },
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
     const response = await api.put<User>(`/usuarios/${id}`, data);
     return response.data;
  }
};
