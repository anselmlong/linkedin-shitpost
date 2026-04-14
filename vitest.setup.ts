import { beforeEach } from 'vitest';

// Ensure localStorage is properly mocked
if (typeof window !== 'undefined' && !window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
  });
}

// Enhanced jsdom localStorage with proper implementation
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  get length(): number {
    return this.store.size;
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new MockLocalStorage(),
  writable: false,
});
