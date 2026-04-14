import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsage,
  incrementUsage,
  isSoftLimitHit,
  markModalSeen,
  hasSeenModalThisSession,
  _resetSessionFlag,
} from './usageTracker';

const STORAGE_KEY = 'shitpost_usage';

beforeEach(() => {
  globalThis.localStorage.clear();
  _resetSessionFlag();
});

describe('getUsage', () => {
  it('returns count 0 when nothing stored', () => {
    expect(getUsage().count).toBe(0);
  });

  it('resets count to 0 when 24h window has expired', () => {
    globalThis.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 5, windowStart: Date.now() - 25 * 60 * 60 * 1000 })
    );
    expect(getUsage().count).toBe(0);
  });

  it('returns stored count when within 24h window', () => {
    globalThis.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 2, windowStart: Date.now() - 1000 })
    );
    expect(getUsage().count).toBe(2);
  });
});

describe('incrementUsage', () => {
  it('increments count from 0 to 1', () => {
    incrementUsage();
    expect(getUsage().count).toBe(1);
  });

  it('increments count cumulatively', () => {
    incrementUsage();
    incrementUsage();
    incrementUsage();
    expect(getUsage().count).toBe(3);
  });
});

describe('isSoftLimitHit', () => {
  it('returns false when count is below 3', () => {
    incrementUsage();
    incrementUsage();
    expect(isSoftLimitHit()).toBe(false);
  });

  it('returns true when count reaches 3', () => {
    incrementUsage();
    incrementUsage();
    incrementUsage();
    expect(isSoftLimitHit()).toBe(true);
  });

  it('returns true when count exceeds 3', () => {
    for (let i = 0; i < 5; i++) incrementUsage();
    expect(isSoftLimitHit()).toBe(true);
  });
});

describe('session modal flag', () => {
  it('hasSeenModalThisSession returns false initially', () => {
    expect(hasSeenModalThisSession()).toBe(false);
  });

  it('returns true after markModalSeen', () => {
    markModalSeen();
    expect(hasSeenModalThisSession()).toBe(true);
  });

  it('_resetSessionFlag clears the flag', () => {
    markModalSeen();
    _resetSessionFlag();
    expect(hasSeenModalThisSession()).toBe(false);
  });
});
