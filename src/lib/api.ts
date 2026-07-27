function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor || window.location.protocol === 'capacitor:';
}

function getApiBase(): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (envBase) return envBase;
  if (isCapacitor()) return 'https://smart-tutor-android.vercel.app/api';
  return '/api';
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const apiBase = getApiBase();
  const url = path.startsWith('http') ? path : `${apiBase}${path}`;

  const isNative = isCapacitor();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (isNative && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: isNative ? 'omit' : 'include',
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed. Please try again.`);
  }

  const setCookie = res.headers.get('set-cookie');
  if (setCookie && authToken === null) {
    const match = setCookie.match(/smart_tutor_session=([^;]+)/);
    if (match) {
      authToken = match[1];
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text() as any;
}

export function apiUrl(path: string): string {
  return `${getApiBase()}${path}`;
}
