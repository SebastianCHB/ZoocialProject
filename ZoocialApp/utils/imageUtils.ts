import api from '../services/api';

const BASE_URL = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://192.168.1.40:8000';

export function getFullImageUrl(url: string | undefined | null): string | undefined {
  if (!url || url === 'null' || url === 'undefined') return undefined;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('file:')) return url;
  let path = url.startsWith('/') ? url.slice(1) : url;
  if (!path.startsWith('storage/')) {
    path = 'storage/' + path;
  }
  return `${BASE_URL}/${path}`;
}
