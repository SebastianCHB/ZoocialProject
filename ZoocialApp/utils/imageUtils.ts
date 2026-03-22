import api from '../services/api';

// resolver
export function getFullImageUrl(url: string | undefined | null): string | undefined {
  if (!url || url === 'null' || url === 'undefined') return undefined;
  // absolute — new posts return full URL from backend
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('file:')) return url;
  // legacy — old records stored relative paths, build URL from API base
  const baseUrl = api.defaults.baseURL?.replace(/\/api\/?$/, '') ?? '';
  if (!baseUrl) return undefined;
  const path = url.startsWith('/') ? url.slice(1) : url;
  const storagePath = path.startsWith('storage/') ? path : `storage/${path}`;
  return `${baseUrl}/${storagePath}`;
}
