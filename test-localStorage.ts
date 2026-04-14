import { describe, it, expect, beforeEach } from 'vitest';

describe('localStorage test', () => {
  it('should have localStorage', () => {
    console.log('typeof localStorage:', typeof localStorage);
    console.log('localStorage:', localStorage);
    expect(localStorage).toBeDefined();
  });
});
