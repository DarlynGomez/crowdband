
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // In development with devvit playtest, we need to use relative URLs
  // The Devvit framework handles routing them to your server
  return `/${cleanEndpoint}`;
}

/**
 * Wrapper around fetch that uses the correct API URL
 */
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint: string) => 
    apiFetch(endpoint),
  
  post: (endpoint: string, data?: any) => 
    apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (endpoint: string, data?: any) => 
    apiFetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (endpoint: string) => 
    apiFetch(endpoint, { method: 'DELETE' }),
};