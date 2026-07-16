const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      cleaned[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateMobile(mobile: string): boolean {
  return /^\+?[\d\s-]{8,15}$/.test(mobile);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 6) errors.push('Password must be at least 6 characters');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  return { valid: errors.length === 0, errors };
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}
