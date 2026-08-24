import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia. The stub has to cover the modern
// addEventListener/removeEventListener pair as well as the deprecated
// addListener/removeListener one, because MUI's useMediaQuery — reached
// through any component built on GenericTable — subscribes with the former.
window.matchMedia = window.matchMedia || ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false
} as MediaQueryList));

// jsdom does not implement ResizeObserver, which Carbon's Modal subscribes to
// on mount.
window.ResizeObserver = window.ResizeObserver || class {
  observe() {}

  unobserve() {}

  disconnect() {}
};
