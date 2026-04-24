/**
 * Resolves any stored image path to an absolute URL.
 *
 * In development: Vite proxies /storage/* → Laravel localhost, so we use /storage/...
 * In production (AlwaysData): files live at /api/public/storage/... so we prepend the full base.
 *
 * Paths stored in DB can look like:
 *   - "storage/posts/abc.jpg"
 *   - "public/posts/abc.jpg"
 *   - "posts/abc.jpg"
 *   - "https://..."
 */

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
// In prod BASE = 'https://zooocial.alwaysdata.net'
// Storage is symlinked at api/public/storage → api/storage/app/public
const STORAGE_BASE = BASE ? `${BASE}/api/public/storage` : `/storage`;

export function getFullImageUrl(url: string | null | undefined): string | undefined {
    if (!url || url === 'null' || url === 'undefined') return undefined;

    let path = url;
    
    // External URLs or base64 keep intact unless they specifically contain our storage paths
    if (path.startsWith('data:')) return path;
    
    if (path.startsWith('http')) {
        // Look for common Laravel storage structures in the URL.
        // Even if it's an absolute URL, we break it down to its relative path.
        const storageMatch = path.match(/(?:\/storage\/|\/public\/|\/api\/public\/)(.*)$/);
        if (storageMatch && storageMatch[1]) {
            path = storageMatch[1]; // Extract the inner path like "posts/123.jpg"
        } else if (!path.includes(BASE.replace('https://', '').replace('http://', ''))) {
             // If it's truly an external URL (doesn't contain our domain at all), return it unchanged
             return path;
        } else {
             // It's our domain but missing storage prefix, just extract the pathname
             try {
                 path = new URL(path).pathname;
             } catch {
                 // Ignore
             }
        }
    }

    // Normalize: strip leading slashes and any remaining prefixes just to be safe
    path = path
        .replace(/^\/+/, '')
        .replace(/^api\/public\//, '')
        .replace(/^storage\//, '')
        .replace(/^public\//, '');


    return `${STORAGE_BASE}/${path}`;
}
