import {
  afterEach, describe, expect, it
} from 'vitest';
import { env } from '../../env';
import { isSeedlotBEnabled } from '../../config/features';

const setFlag = (value: unknown) => {
  if (value === undefined) {
    delete env.VITE_SEEDLOT_B_ENABLED;
  } else {
    env.VITE_SEEDLOT_B_ENABLED = value;
  }
};

describe('Seedlot B feature flag', () => {
  afterEach(() => setFlag(undefined));

  it('is disabled when the ConfigMap key is absent', () => {
    setFlag(undefined);
    expect(isSeedlotBEnabled()).toBe(false);
  });

  it('is disabled when Caddy substitutes an empty string', () => {
    setFlag('');
    expect(isSeedlotBEnabled()).toBe(false);
  });

  it('is enabled only for "true"', () => {
    setFlag('true');
    expect(isSeedlotBEnabled()).toBe(true);
    setFlag('TRUE');
    expect(isSeedlotBEnabled()).toBe(true);
  });

  it('is disabled for "false", regardless of casing', () => {
    setFlag('false');
    expect(isSeedlotBEnabled()).toBe(false);
    setFlag('FALSE');
    expect(isSeedlotBEnabled()).toBe(false);
  });

  it('treats any other value as disabled', () => {
    setFlag('no');
    expect(isSeedlotBEnabled()).toBe(false);
  });
});
