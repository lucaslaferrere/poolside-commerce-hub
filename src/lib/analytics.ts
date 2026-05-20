const BASE = (import.meta.env.VITE_API_URL as string) ?? '';

function getSessionId(): string {
  const key = '_psid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function trackEvent(type: string, payload?: Record<string, unknown>): void {
  try {
    fetch(`${BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, session_id: getSessionId(), payload }),
    }).catch(() => {/* fire-and-forget */});
  } catch {
    // never throw
  }
}
