/**
 * Resolves any stored image path to an absolute URL.
 *
 * En desarrollo: Vite proxies /storage/* → Laravel localhost, so we use /storage/...
 * En producción (AlwaysData): el root .htaccess reescribe /storage/* → laravel/public/storage/*
 *
 * Paths almacenados en BD pueden ser:
 *   - "posts/abc.jpg"           (nuevo formato - path relativo)
 *   - "avatars/abc.jpg"         (nuevo formato - path relativo)
 *   - "storage/posts/abc.jpg"   (formato legacy)
 *   - "https://..."             (URL externa - pasa sin cambios)
 *   - "data:..."                (base64 - pasa sin cambios)
 */

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
// STORAGE_URL_FIX - Usar /storage/* (root .htaccess lo reescribe a laravel/public/storage/*)
// En dev, Vite proxies /storage → localhost:8000. En prod, .htaccess lo resuelve.
const STORAGE_BASE = BASE ? `${BASE}/storage` : `/storage`;

export function getFullImageUrl(url: string | null | undefined): string | undefined {
    if (!url || url === 'null' || url === 'undefined') return undefined;

    let path = url;

    // Base64 y data URIs pasan sin cambios
    if (path.startsWith('data:')) return path;

    if (path.startsWith('http')) {
        // Para URLs absolutas, extraer el path relativo interno
        const storageMatch = path.match(/(?:\/storage\/|\/public\/|\/api\/public\/|\/laravel\/public\/storage\/)(.*)$/);
        if (storageMatch && storageMatch[1]) {
            path = storageMatch[1]; // Extraer "posts/abc.jpg"
        } else if (!path.includes(BASE.replace('https://', '').replace('http://', ''))) {
            // URL externa real (otro dominio) - devolver sin cambios
            return path;
        } else {
            // Misma app pero sin prefijo de storage conocido
            try {
                path = new URL(path).pathname;
            } catch {
                // ignorar error de parsing
            }
        }
    }

    // Normalizar: quitar slashes iniciales y prefijos conocidos
    path = path
        .replace(/^\/+/, '')
        .replace(/^laravel\/public\/storage\//, '')
        .replace(/^api\/public\/storage\//, '')
        .replace(/^storage\//, '')
        .replace(/^public\//, '');

    // path ahora es relativo, e.g. "posts/abc.jpg" o "avatars/abc.jpg"
    return `${STORAGE_BASE}/${path}`;
}
