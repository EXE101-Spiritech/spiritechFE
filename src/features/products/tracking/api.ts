import { API_BASE } from '@/shared/api/axiosClient';

/**
 * Fire-and-forget tracking — never await, never catch errors.
 * No auth required, returns 202 immediately.
 */
export function track(eventType: string, payload: Record<string, unknown> = {}): void {
  fetch(`${API_BASE}/v1/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, payload }),
  }).catch(() => {
    // Silently ignore
  });
}
