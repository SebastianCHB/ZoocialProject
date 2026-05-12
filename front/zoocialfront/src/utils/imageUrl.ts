
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
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
