import api from './api';
import { Platform } from 'react-native';

export type Comment = {
  id: number;
  content: string;
  id_usuario: number;
  id_post: number;
  created_at: string;
  usuario?: { id_usuario: number; nombre_completo: string; rol: string };
};

export type Post = {
  id: number;
  content: string;
  image_url?: string;
  likes: number;
  id_usuario: number;
  created_at: string;
  liked_by_user?: boolean;
  usuario?: { id_usuario: number; nombre_completo: string; rol: string };
  comments?: Comment[];
};

export const postService = {
  // feed
  getFeed: async (): Promise<Post[]> => {
    const res = await api.get('/posts');
    return res.data;
  },

  // mine
  getMyPosts: async (): Promise<Post[]> => {
    const res = await api.get('/posts/user');
    return res.data;
  },

  // create
  create: async (content: string, imageUri?: string): Promise<Post> => {
    const form = new FormData();
    form.append('content', content);
    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const ext = filename.split('.').pop() || 'jpg';
      if (Platform.OS === 'web') {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            form.append('image', blob as any, filename);
        } catch(e) {
            form.append('image', { uri: imageUri, type: `image/${ext}`, name: filename } as any);
        }
      } else {
        form.append('image', { uri: imageUri, type: `image/${ext}`, name: filename } as any);
      }
    }
    const res = await api.post('/posts', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // delete
  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // like
  toggleLike: async (id: number): Promise<{ likes: number; likedByUser: boolean }> => {
    const res = await api.post(`/posts/${id}/like`);
    return { likes: res.data.likes, likedByUser: res.data.likedByUser };
  },

  // comment
  addComment: async (postId: number, content: string): Promise<Comment> => {
    const res = await api.post(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  // destroy
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
