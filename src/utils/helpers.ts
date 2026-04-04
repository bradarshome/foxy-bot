// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Format milliseconds to clock string
export function clockString(ms: number): string {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

// Format seconds to runtime string
export function runtime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  return parts.join(' ') || '0s';
}

// Sleep for ms
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if string is URL
export function isUrl(text: string): boolean {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi.test(text);
}

// Pick random item from array
export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// Similarity score using Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return (maxLen - levenshtein(a, b)) / maxLen;
}

// Extract WhatsApp group invite code from URL
export function extractGroupCode(url: string): string | null {
  const match = url.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
  return match ? match[1] : null;
}

// Normalize phone number (remove non-digits)
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Format phone number to JID
export function toJid(phone: string, useLid = false): string {
  const clean = normalizePhone(phone);
  if (useLid) return `${clean}@lid`;
  return `${clean}@s.whatsapp.net`;
}

// Parse mention from text
export function parseMention(text: string): string[] {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => `${v[1]}@s.whatsapp.net`);
}

// Get random string
export function getRandom(ext: string): string {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
}

// Format date
export function formatDate(timestamp: number, locale = 'id'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
}

// Encode string to letters only
export function encodeToLetters(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (/[a-zA-Z]/.test(char)) {
      result += char;
    } else if (char !== ' ') {
      result += String.fromCharCode(97 + (str.charCodeAt(i) % 26));
    }
  }
  return result || 'user';
}

// Handle and log errors gracefully
export function handleError(error: unknown, context: string): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}] Error: ${message}`);
}

// Safe JSON parse
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  }) as T;
}
