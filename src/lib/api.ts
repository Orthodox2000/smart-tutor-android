const API_BASE = 'https://smarttutors.co.in/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return res.json();
}

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
