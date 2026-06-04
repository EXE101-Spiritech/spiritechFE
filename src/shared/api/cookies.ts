// ── Cookie helpers ──────────────────────────────────────────────────────────
// Tokens stored as cookies with SameSite=Strict for CSRF protection.
// Note: These are NOT HttpOnly (JavaScript-set cookies), so they're still
// accessible to XSS. Full HttpOnly protection requires backend changes.

const COOKIE_OPTIONS = '; path=/; SameSite=Strict';

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds?: number): void {
  let cookie = `${name}=${encodeURIComponent(value)}${COOKIE_OPTIONS}`;
  if (maxAgeSeconds !== undefined) {
    cookie += `; max-age=${maxAgeSeconds}`;
  }
  document.cookie = cookie;
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; SameSite=Strict; max-age=0`;
}
