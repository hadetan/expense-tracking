import '@testing-library/jest-dom';

interface ImportMeta {
  env: {
    VITE_API_BASE_URL: string;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  };
}

(globalThis as { import?: { meta: ImportMeta } }).import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    },
  },
};


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

interface IntersectionObserverInit {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

(globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver = class IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback?: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  disconnect() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(_target: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(_target: Element) {}
} as unknown as typeof IntersectionObserver;

(globalThis as { console: Console }).console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
