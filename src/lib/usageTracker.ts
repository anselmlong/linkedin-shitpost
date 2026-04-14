const STORAGE_KEY = 'shitpost_usage';
const WINDOW_MS = 24 * 60 * 60 * 1000;
const SOFT_LIMIT = 3;

interface Usage {
  count: number;
  windowStart: number;
}

let sessionModalSeen = false;

export function getUsage(): Usage {
  if (typeof window === 'undefined') return { count: 0, windowStart: Date.now() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, windowStart: Date.now() };
    const usage = JSON.parse(raw) as Usage;
    if (Date.now() - usage.windowStart > WINDOW_MS) {
      return { count: 0, windowStart: Date.now() };
    }
    return usage;
  } catch {
    return { count: 0, windowStart: Date.now() };
  }
}

export function incrementUsage(): void {
  const usage = getUsage();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: usage.count + 1, windowStart: usage.windowStart })
    );
  } catch {
    // Storage quota exceeded or unavailable — silently skip
  }
}

export function isSoftLimitHit(): boolean {
  return getUsage().count >= SOFT_LIMIT;
}

export function markModalSeen(): void {
  sessionModalSeen = true;
}

export function hasSeenModalThisSession(): boolean {
  return sessionModalSeen;
}

/** Only for tests — resets the in-memory session flag */
export function _resetSessionFlag(): void {
  sessionModalSeen = false;
}
