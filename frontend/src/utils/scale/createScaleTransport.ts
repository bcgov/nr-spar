import { ScaleTransport } from './types';
import { SerialOptions, WebSerialTransport } from './WebSerialTransport';

type MockModule = { MockTransport: new () => ScaleTransport };

/**
 * The one place screens get their balance connection from. Always use this
 * instead of creating a WebSerialTransport directly.
 *
 * Production (and any deployed environment) always gets the real Web Serial
 * connection: `import.meta.env.DEV` is false in `vite build`, so Vite removes the
 * simulator branch from the bundle entirely.
 *
 * Local development only: to use the simulated balance instead of a real one,
 * 1. copy src/__test__/__mocks__/MockTransport.ts to src/utils/scale/MockTransport.ts
 *    (gitignored, so it can't be committed), and
 * 2. add VITE_SCALE_MOCK=true to frontend/.env, then restart `npm start`.
 * Drive it from the DevTools console via `window.scaleMock` (see the mock's header).
 * Without the copy or the setting, you get the real balance.
 *
 * Reads import.meta.env directly, not src/env.ts, on purpose: deployed runtime
 * config (/env.js) must never be able to switch this on.
 */
export const createScaleTransport = async (
  options?: Partial<SerialOptions>
): Promise<ScaleTransport> => {
  if (import.meta.env.DEV && import.meta.env.VITE_SCALE_MOCK === 'true') {
    // import.meta.glob finds nothing (rather than failing the build) when the
    // gitignored copy isn't there, e.g. in CI or on other devs' machines.
    const load = import.meta.glob<MockModule>('./MockTransport.ts')['./MockTransport.ts'];
    if (load) {
      const { MockTransport } = await load();
      const mock = new MockTransport();
      // A global so devs can drive it from the DevTools console as `scaleMock`.
      (globalThis as typeof globalThis & { scaleMock?: ScaleTransport }).scaleMock = mock;
      // eslint-disable-next-line no-console
      console.info('[scale] Using the simulated balance (VITE_SCALE_MOCK). Control it via window.scaleMock.');
      return mock;
    }
    // eslint-disable-next-line no-console
    console.warn('[scale] VITE_SCALE_MOCK is set but src/utils/scale/MockTransport.ts is missing; using the real balance.');
  }
  return new WebSerialTransport(options);
};
