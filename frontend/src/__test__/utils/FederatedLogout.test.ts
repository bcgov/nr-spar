import { describe, expect, it } from 'vitest';

import { buildFederatedLogoutUrl } from '../../aws-exports';
import { env } from '../../env';

describe('buildFederatedLogoutUrl (#2639)', () => {
  it('chains Siteminder -> Keycloak -> Cognito -> app, each hop keeping its own redirect', () => {
    const siteminder = new URL(buildFederatedLogoutUrl('idir', 'https://spar.example/')!);
    expect(siteminder.pathname).toBe('/clp-cgi/logoff.cgi');
    expect(siteminder.searchParams.get('retnow')).toBe('1');

    const keycloak = new URL(siteminder.searchParams.get('returl')!);
    expect(keycloak.pathname).toBe('/auth/realms/standard/protocol/openid-connect/logout');
    expect(keycloak.searchParams.get('client_id')).toBe('fsa-cognito-idir-dev-4088');

    // The bug this guards against: an unencoded inner URL loses this param at logoff.cgi.
    const cognito = new URL(keycloak.searchParams.get('post_logout_redirect_uri')!);
    expect(cognito.pathname).toBe('/logout');
    expect(cognito.searchParams.get('client_id')).toBe(String(env.VITE_USER_POOLS_WEB_CLIENT_ID));
    expect(cognito.searchParams.get('logout_uri')).toBe('https://spar.example/');
  });

  it('uses the BCeID Business Keycloak client for BCeID users', () => {
    const siteminder = new URL(buildFederatedLogoutUrl('BCEIDBUSINESS', 'https://spar.example/')!);
    const keycloak = new URL(siteminder.searchParams.get('returl')!);
    expect(keycloak.searchParams.get('client_id')).toBe('fsa-cognito-b-ce-id-business-dev-4090');
  });

  it('returns null without a known provider, so signOut falls back to Amplify', () => {
    expect(buildFederatedLogoutUrl('')).toBeNull();
  });
});
