/* eslint-disable no-console */
import React, {
  useMemo,
  useState
} from 'react';
import {
  signInWithRedirect,
  signOut as awsSignOut,
  fetchAuthSession,
  decodeJWT
} from 'aws-amplify/auth';
import type { AuthSession } from 'aws-amplify/auth';
import axios from 'axios';
import { UserClientRolesType } from '../types/UserRoleType';
import { env } from '../env';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';
import AuthContext, { AuthContextData } from './AuthContext';
import { MINISTRY_OF_FOREST_ID, SPAR_REDIRECT_PATH, TSC_ADMIN_ROLE } from '../shared-constants/shared-constants';
import { TWO_MINUTE } from '../config/TimeUnits';
import ROUTES from '../routes/constants';

interface Props {
  children: React.ReactNode;
}

const findFindAndLastName = (displayName: string, provider: string): Array<string> => {
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

const parseRole = (accessToken: { [id: string]: any }): UserClientRolesType[] => {
  const separator = '_';

  const cognitoGroups: string[] = accessToken['cognito:groups'];
  if (!cognitoGroups) {
    return [];
  }

  const parsedClientRoles: UserClientRolesType[] = [];

  cognitoGroups.forEach((cognitoRole) => {
    if (!cognitoRole.includes(separator)) {
      throw new Error(`Invalid role format with string: ${cognitoRole}`);
    }
    const lastUnderscoreIndex = cognitoRole.lastIndexOf(separator);
    let role = cognitoRole.substring(0, lastUnderscoreIndex);
    let clientId = cognitoRole.substring(lastUnderscoreIndex + 1);

    // If the last substring after an underscore is not a number then it's a concrete role,
    // we need to manually assign it a MoF client id for now.
    if (Number.isNaN(Number(clientId))) {
      clientId = MINISTRY_OF_FOREST_ID;
      role = cognitoRole;
    }

    // Check if a client id already exist in parsed client role
    const found = parsedClientRoles.find((clientRoles) => clientRoles.clientId === clientId);

    if (found) {
      const idx = parsedClientRoles.findIndex((clientRoles) => clientRoles.clientId === clientId);
      parsedClientRoles[idx].roles.push(role);
    } else {
      parsedClientRoles.push({
        clientId,
        roles: [role]
      });
    }
  });

  return parsedClientRoles;
};

/**
 * Parses a CognitoUserSession into a JS object. For a deeper understanding
 * you can take a look on the attribute mapping reference at:
 * https://github.com/bcgov/nr-forests-access-management/wiki/OIDC-Attribute-Mapping
 *
 * @param {AuthSession} session CognitoUserSession to be parsed.
 * @returns {FamUser} The FamUser object
 */
const parseToken = (session: AuthSession): FamUser => {
  const accessToken = session.tokens?.accessToken;
  const idToken = session.tokens?.idToken;
  if (!accessToken || !idToken) {
    throw new Error('The user is not authenticated');
  }

  const decodedIdToken: Record<string, any> = decodeJWT(idToken.toString()).payload;
  const decodedAccessToken: Record<string, any> = decodeJWT(accessToken.toString()).payload;
  // Extract the first name and last name from the displayName and remove unwanted part
  const displayName = decodedIdToken['custom:idp_display_name'] as string;
  const idpProvider = (decodedIdToken['custom:idp_name'] as string).toUpperCase();
  const idpUsername = (decodedIdToken['custom:idp_username'] as string).toUpperCase();
  const [firstName, lastName] = findFindAndLastName(displayName, idpProvider);

  const famUser: FamUser = {
    displayName: decodedIdToken['custom:idp_display_name'], // E.g: 'de Campos, Ricardo WLRS:EX'
    email: decodedIdToken.email,
    lastName,
    firstName,
    providerUsername: idpUsername, // E.g: RDECAMPO
    name: `${firstName} ${lastName}`,
    clientRoles: parseRole(decodedAccessToken),
    provider: decodedIdToken['custom:idp_name'].toLocaleUpperCase(),
    jwtToken: idToken.toString(),
    userId: `${idpProvider}@${idpUsername}` // E.g: 'IDIR@GROOT'
  };

  return famUser;
};

const clientIdLocalStorageKey = 'selected-client-id';
const clientNameLocalStorageKey = 'selected-client-name';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<FamUser | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [intervalInstance, setIntervalInstance] = useState<NodeJS.Timeout | null>(null);
  const [selectedClientRoles, setSelectedClientRoles] = useState<UserClientRolesType | null>(null);
  const [isTscAdmin, setIsTscAdmin] = useState<boolean>(false);

  const setClientRoles = (clientRoles: UserClientRolesType, reload?: boolean) => {
    localStorage.setItem(clientIdLocalStorageKey, clientRoles.clientId);
    if (clientRoles.clientName) {
      localStorage.setItem(clientNameLocalStorageKey, clientRoles.clientName);
    }
    setIsTscAdmin(clientRoles.roles.includes(TSC_ADMIN_ROLE));
    setSelectedClientRoles(clientRoles);
    if (reload) {
      window.location.href = '/';
    }
  };

  const fetchFamCurrentSession = async (pathname: string): Promise<FamUser | null> => {
    try {
      const session: AuthSession = await fetchAuthSession({ forceRefresh: true });
      const famUser = parseToken(session);
      // Check if selected role still exists on user profile
      if (selectedClientRoles) {
        const foundFamClientRoles = famUser.clientRoles.find((famClientRole) => (
          famClientRole.clientId === selectedClientRoles.clientId
        ));
        if (foundFamClientRoles) {
          selectedClientRoles.roles.forEach((selectedRole) => {
            if (!foundFamClientRoles.roles.includes(selectedRole)) {
              setSigned(false);
              throw new Error(`User role revoked for role: ${selectedRole} and client id: ${selectedClientRoles.clientId}`);
            }
          });
        } else {
          setSigned(false);
          throw new Error(`User roles revoked for client id: ${selectedClientRoles.clientId}`);
        }
      }
      setSigned(true);
      return famUser;
    } catch (e) {
      console.warn(e);
      // Clear stored client id and name
      localStorage.clear();
      localStorage.setItem(SPAR_REDIRECT_PATH, pathname);
      setSelectedClientRoles(null);
      setUser(null);
      setSigned(false);
    }
    return null;
  };

  const updateUserFamSession = (famUser: FamUser) => {
    // axios token
    axios.defaults.headers.common = {
      Authorization: `Bearer ${famUser.jwtToken}`
    };
  };

  // Restore selected client on refresh
  const restoreSelectedClient = (famUser: FamUser) => {
    const selectedClientId = localStorage.getItem(clientIdLocalStorageKey);
    if (selectedClientId) {
      const foundClient = famUser.clientRoles.find((cr) => cr.clientId === selectedClientId);
      if (foundClient) {
        const restoredClientName = localStorage.getItem(clientNameLocalStorageKey);
        if (restoredClientName) {
          foundClient.clientName = restoredClientName;
        }
        setIsTscAdmin(foundClient.roles.includes(TSC_ADMIN_ROLE));
        setSelectedClientRoles(foundClient);
      }
    }
  };

  const isCurrentAuthUser = async (pathname: string) => {
    const famUser = await fetchFamCurrentSession(pathname);
    if (famUser) {
      if (famUser.clientRoles.length === 1) {
        // If a user has only 1 client role then set it right away.
        setSelectedClientRoles(famUser.clientRoles[0]);
        setIsTscAdmin(famUser.clientRoles[0].roles.includes(TSC_ADMIN_ROLE));
      } else {
        restoreSelectedClient(famUser);
      }
      updateUserFamSession(famUser);
      setUser(famUser);
      setProvider(famUser.provider);
    }
  };

  const signIn = (signInProvider: LoginProviders): void => {
    const appEnv = env.VITE_ZONE ?? 'DEV';

    signInWithRedirect({
      provider: {
        custom: `${(appEnv).toLocaleUpperCase()}-${String(signInProvider)}`
      }
    });
  };

  const signOut = (): void => {
    awsSignOut()
      .then(() => {
        setSelectedClientRoles(null);
        setSigned(false);
        setUser(null);
        setProvider('');
        setIsTscAdmin(false);
        if (intervalInstance) {
          console.log('stopping refresh token');
          clearInterval(intervalInstance);
          setIntervalInstance(null);
        }
        localStorage.clear();
      }).catch((err) => console.warn(err));
  };

  const refreshTokenPvt = async () => {
    const famUser = await fetchFamCurrentSession(ROUTES.ROOT);
    if (famUser) {
      updateUserFamSession(famUser);
    }
  };

  // 2 minutes
  const REFRESH_TIMER = TWO_MINUTE;

  if (intervalInstance == null && signed) {
    const instance = setInterval(() => {
      refreshTokenPvt()
        .then(() => {
          console.log('User session successfully refreshed!');
        })
        .catch((e) => console.error(e));
    }, REFRESH_TIMER);

    setIntervalInstance(instance);
  }

  // memoize
  const contextValue: AuthContextData = useMemo(() => ({
    signed,
    user,
    isCurrentAuthUser,
    signIn,
    signOut,
    provider,
    selectedClientRoles,
    setClientRoles,
    isTscAdmin
  }), [
    signed, user, isCurrentAuthUser, signIn, signOut,
    provider, selectedClientRoles, isTscAdmin
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
