import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';
import { UserClientRolesType } from '../types/UserRoleType';
import { MINISTRY_OF_FOREST_ID } from '../shared-constants/shared-constants';

// FAM writes scope suffixes in the order district, region, forest client.
const FOREST_CLIENT_SCOPE = '_FOREST_CLIENT';
const SCOPE_TYPES = [FOREST_CLIENT_SCOPE, '_DISTRICT', '_REGION'];

const decodeJwtPayload = (token: string): Record<string, any> => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

/**
 * Strips scope suffixes from the right: the value is what follows the last '-', and the
 * text before it must end in a known scope type. Never split on underscores, region values
 * contain them. Mirrors CssRoleNaming.parse in nr-fam.
 */
const parseRole = (name: string): { role: string, clientId: string | null } => {
  let role = name;
  let clientId: string | null = null;
  let dash = role.lastIndexOf('-');
  while (dash > 0) {
    const head = role.substring(0, dash);
    const scope = SCOPE_TYPES.find((type) => head.endsWith(type));
    if (!scope) {
      break;
    }
    if (scope === FOREST_CLIENT_SCOPE) {
      clientId = role.substring(dash + 1);
    }
    role = head.substring(0, head.length - scope.length);
    dash = role.lastIndexOf('-');
  }
  return { role, clientId };
};

/**
 * Groups the token's roles by forest client. A role without a forest client scope belongs
 * to the Ministry of Forests client.
 *
 * CSS emits client_roles; stock Keycloak uses resource_access.<azp>.roles, so read both.
 * FAM: roles are FAM bookkeeping (e.g. grant expiry), not permissions.
 */
export const parseRoles = (claims: Record<string, any>): UserClientRolesType[] => {
  const rawRoles: string[] = [
    ...(claims.client_roles ?? []),
    ...(claims.resource_access?.[claims.azp]?.roles ?? [])
  ].filter((role: string) => !role.startsWith('FAM:'));

  const parsedClientRoles: UserClientRolesType[] = [];
  rawRoles.forEach((rawRole) => {
    const { role, clientId: scopedClientId } = parseRole(rawRole);
    const clientId = scopedClientId ?? MINISTRY_OF_FOREST_ID;
    const found = parsedClientRoles.find((clientRoles) => clientRoles.clientId === clientId);
    if (found) {
      found.roles.push(role);
    } else {
      parsedClientRoles.push({ clientId, roles: [role] });
    }
  });
  return parsedClientRoles;
};

const findFirstAndLastName = (displayName: string, provider: string): Array<string> => {
  let splitString = ', ';
  if (!displayName.includes(splitString)) {
    splitString = ' ';
  }
  const parts = displayName.split(splitString);
  let firstName = parts[0];
  let lastName = parts[1];

  if (parts.length > 2) {
    lastName = `${lastName} ${parts[2]}`;
  }

  if (provider === LoginProviders.IDIR) {
    firstName = parts[1].split(' ')[0].trim();
    lastName = parts[0].includes(' ') ? parts[0].split(' ')[1] : parts[0];
  }

  return [firstName, lastName];
};

/**
 * Parses a BC Gov SSO access token into a FamUser. The access token is what the APIs
 * receive, so the user is read from the same claims they read.
 *
 * IDIR-MFA reports its provider as azureidir; it is normalised to IDIR so the user id stays
 * IDIR@USERNAME, which keys My Seedlots and the audit columns.
 */
export const parseToken = (accessToken: string): FamUser => {
  const claims = decodeJwtPayload(accessToken);
  const rawProvider = String(claims.identity_provider ?? '').toUpperCase();
  const provider = rawProvider === 'AZUREIDIR' ? LoginProviders.IDIR : rawProvider;
  const isIdir = provider === LoginProviders.IDIR;
  const username = String((isIdir ? claims.idir_username : claims.bceid_username) ?? '')
    .toUpperCase();
  const displayName: string = claims.display_name ?? '';
  const [firstName, lastName] = findFirstAndLastName(displayName, provider);

  return {
    displayName, // E.g: 'de Campos, Ricardo WLRS:EX'
    email: claims.email,
    lastName,
    firstName,
    providerUsername: username, // E.g: RDECAMPO
    name: `${firstName} ${lastName}`,
    clientRoles: parseRoles(claims),
    provider,
    jwtToken: accessToken,
    userId: `${provider}@${username}` // E.g: 'IDIR@GROOT'
  };
};
