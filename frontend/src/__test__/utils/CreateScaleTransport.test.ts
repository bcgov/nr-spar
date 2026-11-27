import {
  afterEach, beforeEach, describe, expect, it, vi
} from 'vitest';

import { createScaleTransport } from '../../utils/scale/createScaleTransport';
import { WebSerialTransport } from '../../utils/scale/WebSerialTransport';

// The local simulator copy is gitignored: present on some dev machines, absent in CI.
const localCopyExists = Object.keys(
  import.meta.glob('../../utils/scale/MockTransport.ts')
).length > 0;

type WithScaleMock = typeof globalThis & { scaleMock?: unknown };

describe('createScaleTransport', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete (globalThis as WithScaleMock).scaleMock;
  });

  it('returns the real Web Serial transport by default', async () => {
    vi.stubEnv('VITE_SCALE_MOCK', '');
    expect(await createScaleTransport()).toBeInstanceOf(WebSerialTransport);
  });

  it('passes serial options through to the real transport', async () => {
    vi.stubEnv('VITE_SCALE_MOCK', '');
    const transport = await createScaleTransport({ baudRate: 9600 }) as WebSerialTransport;
    expect(transport.options.baudRate).toBe(9600);
    expect(transport.options.parity).toBe('even'); // the rest stay at the defaults
  });

  it('only enables the simulator for the exact value "true"', async () => {
    vi.stubEnv('VITE_SCALE_MOCK', 'yes');
    expect(await createScaleTransport()).toBeInstanceOf(WebSerialTransport);
    expect((globalThis as WithScaleMock).scaleMock).toBeUndefined();
  });

  it('ignores VITE_SCALE_MOCK outside dev (production builds)', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_SCALE_MOCK', 'true');
    expect(await createScaleTransport()).toBeInstanceOf(WebSerialTransport);
    expect((globalThis as WithScaleMock).scaleMock).toBeUndefined();
  });

  it.runIf(localCopyExists)('uses the local simulator copy when VITE_SCALE_MOCK is set, and exposes it as scaleMock', async () => {
    vi.stubEnv('VITE_SCALE_MOCK', 'true');
    const transport = await createScaleTransport();
    expect(transport).not.toBeInstanceOf(WebSerialTransport);
    expect((globalThis as WithScaleMock).scaleMock).toBe(transport);
    expect(console.info).toHaveBeenCalledOnce();
  });

  it.runIf(!localCopyExists)('falls back to the real transport with a warning when the local copy is missing', async () => {
    vi.stubEnv('VITE_SCALE_MOCK', 'true');
    expect(await createScaleTransport()).toBeInstanceOf(WebSerialTransport);
    expect(console.warn).toHaveBeenCalledOnce();
    expect((globalThis as WithScaleMock).scaleMock).toBeUndefined();
  });
});
