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

/**
 * Parses a CognitoUserSession into a JS object. For a deeper understanding
 * you can take a look on the attribute mapping reference at:
 * https://github.com/bcgov/nr-forests-access-management/wiki/OIDC-Attribute-Mapping
 *
 * @param {CognitoUserSession} authToken CognitoUserSession to be parsed.
 * @returns {FamUser} The FamUser object
 */
const parseToken = (authToken: CognitoUserSession): FamUser => {
  const decodedIdToken = authToken.getIdToken().decodePayload();
  const decodedAccessToken = authToken.getAccessToken().decodePayload();

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
    roles: decodedAccessToken['cognito:groups'],
    provider: decodedIdToken['custom:idp_name'].toLocaleUpperCase(),
    jwtToken: authToken.getIdToken().getJwtToken(),
    refreshToken: authToken.getRefreshToken().getToken(),
    userId: `${idpProvider}@${idpUsername}`, // E.g: 'IDIR@GROOT'
    tokenExpiration: authToken.getIdToken().getExpiration()
  };

  return famUser;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<FamUser | null>(null);
  const [provider, setProvider] = useState<string>('');
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
    }
  };

  const signIn = (signInProvider: LoginProviders): void => {
    let appEnv = env.VITE_ZONE ?? 'DEV';

    // Workaround for the Business BCeID in TEST calling actually PROD
    const applyWorkaround = signInProvider === LoginProviders.BCEID_BUSINESS
        && appEnv === 'TEST';
    if (applyWorkaround) {
      appEnv = 'PROD';
    }

    Auth.federatedSignIn({
      customProvider: `${(appEnv).toLocaleUpperCase()}-${signInProvider.toString()}`
    });
  };

  const signOut = (): void => {
    Auth.signOut()
      .then(() => {
        setSigned(false);
        setUser(null);
        setProvider('');
        if (intervalInstance) {
          console.log('stopping refresh token');
          clearInterval(intervalInstance);
          setIntervalInstance(null);
        }
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
  const contextValue = useMemo(() => ({
    signed,
    user,
    isCurrentAuthUser,
    signIn,
    signOut,
    provider
  }), [signed, user, isCurrentAuthUser, signIn, signOut, provider]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
