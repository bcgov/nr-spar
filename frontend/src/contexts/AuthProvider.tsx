/* eslint-disable no-console */
import React, {
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import axios from 'axios';
import { UserClientRolesType } from '../types/UserRoleType';
import { env } from '../env';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';
import AuthContext, { AuthContextData } from './AuthContext';
import { SPAR_REDIRECT_PATH, TSC_ADMIN_ROLE } from '../shared-constants/shared-constants';
import { parseToken } from '../utils/FamTokenUtils';
import { TWO_MINUTE } from '../config/TimeUnits';
import ROUTES from '../routes/constants';

interface Props {
  children: React.ReactNode;
}

// The CSS integration's client id is the same in dev, test and prod; only the issuer differs.
const KEYCLOAK_CLIENT_ID = 'spar-seed-planning-and-registry-application-6734';
const DEV_ISSUER = 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard';
const AUTH_CALLBACK_PATH = '/authCallback';

// Redirect URIs are derived from the origin so one image serves PR previews, test and prod.
// Tokens live in localStorage, like Amplify's did, so a new tab is already signed in.
const userManager = new UserManager({
  authority: env.VITE_KEYCLOAK_ISSUER || DEV_ISSUER,
  client_id: KEYCLOAK_CLIENT_ID,
  redirect_uri: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: 'code',
  scope: 'openid',
  userStore: new WebStorageStateStore({ store: window.localStorage })
});

// The authorization code is single-use and React StrictMode runs effects twice in dev,
// so every caller shares one exchange.
let callbackExchange: Promise<unknown> | null = null;
const completeSignInCallback = (): Promise<unknown> => {
  if (window.location.pathname !== AUTH_CALLBACK_PATH) {
    return Promise.resolve();
  }
  callbackExchange ??= userManager.signinRedirectCallback()
    .finally(() => window.history.replaceState(null, '', ROUTES.ROOT));
  return callbackExchange;
};

const clientIdLocalStorageKey = 'selected-client-id';
const clientNameLocalStorageKey = 'selected-client-name';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signedState, setSignedState] = useState<boolean>(false);
  const signed = signedState;
  // Mirrors `signed` synchronously. Sign-out swaps the router in the same render that
  // flips `signed`, so pages unmount without ever seeing false; their unmount auto save
  // reads this instead.
  const signedRef = useRef(false);
  const setSigned = (value: boolean) => {
    signedRef.current = value;
    setSignedState(value);
  };
  const isSignedIn = useCallback(() => signedRef.current, []);
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
      await completeSignInCallback();
      if (!await userManager.getUser()) {
        throw new Error('The user is not authenticated');
      }
      // Always refresh, like Amplify's forceRefresh: a fresh token carries revoked roles.
      const oidcUser = await userManager.signinSilent();
      if (!oidcUser) {
        throw new Error('The user session could not be refreshed');
      }
      const famUser = parseToken(oidcUser.access_token);
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
      if (pathname !== AUTH_CALLBACK_PATH) {
        localStorage.setItem(SPAR_REDIRECT_PATH, pathname);
      }
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
    // IDIR goes through IDIR-MFA, whose Keycloak alias is azureidir.
    const idpHint = signInProvider === LoginProviders.IDIR ? 'azureidir' : 'bceidbusiness';
    userManager.signinRedirect({ extraQueryParams: { kc_idp_hint: idpHint } })
      .catch((err) => console.warn(err));
  };

  const signOut = async (): Promise<void> => {
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
    // Keycloak needs the id token to end the realm session; clearing it first would leave
    // the session alive and the next sign-in would skip the prompt.
    const oidcUser = await userManager.getUser();
    localStorage.clear();
    try {
      await userManager.signoutRedirect({ id_token_hint: oidcUser?.id_token });
    } catch (err) {
      console.warn(err);
      window.location.href = ROUTES.ROOT;
    }
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
    isTscAdmin,
    isSignedIn
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
