/* eslint-disable no-undef */
import { parseRoles, parseToken } from '../../utils/FamTokenUtils';
import { MINISTRY_OF_FOREST_ID } from '../../shared-constants/shared-constants';

const toBase64Url = (value: string) => btoa(String.fromCharCode(...new TextEncoder().encode(value)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = (claims: Record<string, unknown>) => [
  toBase64Url(JSON.stringify({ alg: 'RS256' })),
  toBase64Url(JSON.stringify(claims)),
  'signature'
].join('.');

describe('FAM token utils', () => {
  it('groups forest client scoped roles by client and puts unscoped roles on MoF', () => {
    const clientRoles = parseRoles({
      azp: 'spar',
      client_roles: [
        'SPAR_TSC_ADMIN',
        'SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00030064',
        'SPAR_NONMINISTRY_ORCHARD_FOREST_CLIENT-00012345'
      ]
    });

    expect(clientRoles).toEqual([
      { clientId: MINISTRY_OF_FOREST_ID, roles: ['SPAR_TSC_ADMIN'] },
      { clientId: '00030064', roles: ['SPAR_NONMINISTRY_ORCHARD'] },
      { clientId: '00012345', roles: ['SPAR_NONMINISTRY_ORCHARD'] }
    ]);
  });

  it('parses scopes from the right and never splits on underscores', () => {
    const clientRoles = parseRoles({
      azp: 'spar',
      client_roles: [
        'SPAR_NONMINISTRY_ORCHARD_DISTRICT-DCC_FOREST_CLIENT-00030064',
        'SPAR_TSC_SUBMITTER_REGION-KOOTENAY_BOUNDARY'
      ]
    });

    expect(clientRoles).toEqual([
      { clientId: '00030064', roles: ['SPAR_NONMINISTRY_ORCHARD'] },
      { clientId: MINISTRY_OF_FOREST_ID, roles: ['SPAR_TSC_SUBMITTER'] }
    ]);
  });

  it('ignores FAM sidecar roles and other clients in resource_access', () => {
    const clientRoles = parseRoles({
      azp: 'spar',
      resource_access: {
        spar: { roles: ['SPAR_TSC_ADMIN', 'FAM:EXPIRES:2026-12-31:SPAR_TSC_ADMIN'] },
        other: { roles: ['SPAR_TSC_SUPERVISOR'] }
      }
    });

    expect(clientRoles).toEqual([
      { clientId: MINISTRY_OF_FOREST_ID, roles: ['SPAR_TSC_ADMIN'] }
    ]);
  });

  it('returns no roles when the token has none', () => {
    expect(parseRoles({ azp: 'spar' })).toEqual([]);
  });

  it('keeps the IDIR@USERNAME user id for an azureidir login', () => {
    const user = parseToken(makeToken({
      azp: 'spar',
      identity_provider: 'azureidir',
      idir_username: 'baggings',
      display_name: 'Baggings, Bilbo LWRS:EX',
      email: 'bilbo.baggings@gov.bc.ca',
      client_roles: ['SPAR_TSC_ADMIN']
    }));

    expect(user.userId).toBe('IDIR@BAGGINGS');
    expect(user.provider).toBe('IDIR');
    expect(user.providerUsername).toBe('BAGGINGS');
    expect(user.firstName).toBe('Bilbo');
    expect(user.lastName).toBe('Baggings');
    expect(user.clientRoles).toEqual([
      { clientId: MINISTRY_OF_FOREST_ID, roles: ['SPAR_TSC_ADMIN'] }
    ]);
  });

  it('reads the BCeID username for a Business BCeID login', () => {
    const user = parseToken(makeToken({
      azp: 'spar',
      identity_provider: 'bceidbusiness',
      bceid_username: 'mordor-bceid',
      display_name: 'NRS Load Test',
      email: 'nrs.load.test@example.com'
    }));

    expect(user.userId).toBe('BCEIDBUSINESS@MORDOR-BCEID');
    expect(user.provider).toBe('BCEIDBUSINESS');
    expect(user.firstName).toBe('NRS');
    expect(user.lastName).toBe('Load Test');
  });

  it('decodes non-ASCII display names', () => {
    const user = parseToken(makeToken({
      identity_provider: 'idir',
      idir_username: 'RDECAMPO',
      display_name: 'de Campos, Ricardo WLRS:EX'
    }));

    expect(user.displayName).toBe('de Campos, Ricardo WLRS:EX');
    const accented = parseToken(makeToken({
      identity_provider: 'idir',
      idir_username: 'HLEBLANC',
      display_name: 'Leblanc, Hélène WLRS:EX'
    }));
    expect(accented.firstName).toBe('Hélène');
  });
});
