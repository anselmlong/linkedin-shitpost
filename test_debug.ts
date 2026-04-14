import { describe, it, expect } from 'vitest';

describe('debug', () => {
  it('check globals', () => {
    console.log('window:', typeof window);
    console.log('globalThis:', typeof globalThis);
    console.log('localStorage:', typeof localStorage);
    console.log('globalThis.localStorage:', typeof globalThis.localStorage);
    if (typeof window !== 'undefined') {
      console.log('window.localStorage:', typeof window.localStorage);
    }
  });
});
