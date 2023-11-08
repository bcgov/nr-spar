/* eslint-disable no-console */
import React, {
  useMemo,
  useState
} from 'react';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import { env } from '../env';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';
import AuthContext from './AuthContext';
import { SPAR_REDIRECT_PATH } from '../shared-constants/shared-constants';

interface Props {
  children: React.ReactNode;
}

const FAM_LOGIN_USER = 'famLoginUser';

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

/**
 * Parses a CognitoUserSession into a JS object. For a deeper understanding
 * you can take a look on the attribute mapping reference at:
 * https://github.com/bcgov/nr-forests-access-management/wiki/OIDC-Attribute-Mapping
 *
 * @param authToken The CognitoUserSession to be parsed.
 * @returns The FamUser object
 */
const parseToken = (authToken: CognitoUserSession): FamUser => {
  const decodedIdToken = authToken.getIdToken().decodePayload();
  const decodedAccessToken = authToken.getAccessToken().decodePayload();

  // Extract the first name and last name from the displayName and remove unwanted part
  const displayName = decodedIdToken['custom:idp_display_name'] as string;
  const provider = decodedIdToken['custom:idp_name'] as string;
  const [firstName, lastName] = findFindAndLastName(displayName, provider.toUpperCase());
  const famUser: FamUser = {
    displayName: decodedIdToken['custom:idp_display_name'], // E.g: 'de Campos, Ricardo WLRS:EX'
    email: decodedIdToken.email,
    lastName,
    firstName,
    providerUsername: decodedIdToken['custom:idp_username'], // E.g: RDECAMPO
    name: `${firstName} ${lastName}`,
    roles: decodedAccessToken['cognito:groups'],
    provider: decodedIdToken['custom:idp_name'].toLocaleUpperCase(),
    jwtToken: authToken.getIdToken().getJwtToken(),
    refreshToken: authToken.getRefreshToken().getToken(),
    axiosRequestUser: decodedAccessToken.username, // E.g: 'dev-idir_***@idir'
    tokenExpiration: authToken.getIdToken().getExpiration()
  };

  return famUser;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<FamUser | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [intervalInstance, setIntervalInstance] = useState<NodeJS.Timeout | null>(null);

  const fetchFamCurrentSession = async (pathname: string): Promise<FamUser | null> => {
    try {
      const currentSession: CognitoUserSession = await Auth.currentSession();
      const famUser = parseToken(currentSession);
      setSigned(true);
      return famUser;
    } catch (e) {
      console.warn(e);
      localStorage.setItem(SPAR_REDIRECT_PATH, pathname);
      setSigned(false);
    }
    return null;
  };

  const updateUserFamSession = (famUser: FamUser) => {
    localStorage.setItem(FAM_LOGIN_USER, JSON.stringify(famUser));

    // axios token
    axios.defaults.headers.common = {
      Authorization: `Bearer ${famUser.jwtToken}`
    };
  };

  const isCurrentAuthUser = async (pathname: string) => {
    const famUser = await fetchFamCurrentSession(pathname);
    if (famUser) {
      updateUserFamSession(famUser);
      setUser(famUser);
      setProvider(famUser.provider);
      setToken(famUser.axiosRequestUser);
    }
  };

  const signIn = (signInProvider: LoginProviders): void => {
    const appEnv = env.VITE_ZONE ?? 'DEV';

    Auth.federatedSignIn({
      customProvider: `${(appEnv).toLocaleUpperCase()}-${signInProvider.toString()}`
    });
  };

  const signOut = (): void => {
    Auth.signOut()
      .then(() => {
        localStorage.removeItem(FAM_LOGIN_USER);
        setSigned(false);
        setUser(null);
        setProvider('');
        setToken('');
        if (intervalInstance) {
          console.log('stopping refresh token');
          clearInterval(intervalInstance);
          setIntervalInstance(null);
        }
      }).catch((err) => console.warn(err));
  };

  const refreshTokenPvt = async () => {
    const famUser = await fetchFamCurrentSession('/');
    if (famUser) {
      updateUserFamSession(famUser);
    }
  };

  // 2 minutes
  const REFRESH_TIMER = 2 * 60 * 1000;

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
  const contextValue = useMemo(() => ({
    signed,
    user,
    isCurrentAuthUser,
    signIn,
    signOut,
    provider,
    token
  }), [signed, user, isCurrentAuthUser, signIn, signOut, provider, token]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
