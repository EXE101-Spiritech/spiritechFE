import { API_BASE } from "./axiosClient";

/**
 * Ping the server health.
 * Uses the lightest possible endpoint with a short timeout.
 * Returns true if the server responds, false otherwise.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE}/v1/products?limit=1`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
