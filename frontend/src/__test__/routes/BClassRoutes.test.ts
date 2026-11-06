import {
  afterEach, describe, expect, it, vi
} from 'vitest';
import ROUTES from '../../routes/constants';

const B_CLASS_PATHS = [
  ROUTES.SEEDLOTS_B_CLASS_CREATION,
  ROUTES.SEEDLOT_B_CLASS_REGISTRATION,
  ROUTES.SEEDLOT_B_CLASS_REVIEW
];

// The route table evaluates the flag once at module scope, so each case needs a
// fresh module registry rather than a plain re-import. That re-import pulls in
// every view, which is slow — hence a single test covering both states. The flag
// goes on `window.config` (what Caddy's /env.js populates) because resetting the
// registry also rebuilds the `env` module from it.
const loadRoutePaths = async (flag: string): Promise<Array<string | undefined>> => {
  vi.resetModules();
  window.config = { VITE_SEEDLOT_B_ENABLED: flag };
  const { default: routes } = await import('../../routes');
  return routes.map((route) => route.path);
};

describe('B-class routes', () => {
  afterEach(() => {
    window.config = undefined;
    vi.resetModules();
  });

  it('are registered only while the feature is enabled', async () => {
    const enabledPaths = await loadRoutePaths('true');
    B_CLASS_PATHS.forEach((path) => expect(enabledPaths).toContain(path));

    const disabledPaths = await loadRoutePaths('false');
    B_CLASS_PATHS.forEach((path) => expect(disabledPaths).not.toContain(path));

    // A-class is untouched by the toggle.
    expect(disabledPaths).toContain(ROUTES.SEEDLOTS_A_CLASS_CREATION);
    expect(disabledPaths).toContain(ROUTES.SEEDLOT_A_CLASS_REGISTRATION);
    expect(disabledPaths).toContain(ROUTES.SEEDLOT_A_CLASS_REVIEW);
  }, 120_000);
});
