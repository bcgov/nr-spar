import React, {
  useContext,
  useMemo,
  useState
} from 'react';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';
import { env } from '../env';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';
import axios from 'axios';
import { AuthContext } from './AuthContext';

interface Props {
  children: React.ReactNode;
}

const FAM_LOGIN_USER = 'famLoginUser';

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
  const [lastName, firstName] = displayName.split(', ');
  const sanitizedFirstName = firstName.split(' ')[0].trim(); // Remove unwanted part (WLRS:EX)
  const sanitizedLastName = lastName.includes(' ') ? lastName.split(' ')[1].trim() : lastName;

  const famUser: FamUser = {
    displayName: decodedIdToken['custom:idp_display_name'], // E.g: 'de Campos, Ricardo WLRS:EX'
    email: decodedIdToken['email'],
    lastName: sanitizedLastName,
    firstName: sanitizedFirstName,
    idirUsername: decodedIdToken['custom:idp_username'], // E.g: RDECAMPO
    name: `${sanitizedFirstName} ${sanitizedLastName}`,
    roles: decodedAccessToken['cognito:groups'],
    provider: decodedIdToken['custom:idp_name'].toLocaleUpperCase(),
    jwtToken: authToken.getIdToken().getJwtToken(),
    refreshToken: authToken.getRefreshToken().getToken(),
    axiosRequestUser: decodedAccessToken['username'], // E.g: 'dev-idir_d4c2c0d1ebe34a11996bb0a506ab705b@idir'
    tokenExpiration: authToken.getIdToken().getExpiration(),
  };

  return famUser;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<FamUser | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const isCurrentAuthUser = async () => {
    let userIsLoggedIn = false;
    try {
      await Auth.currentAuthenticatedUser();
      userIsLoggedIn = true;
      setSigned(userIsLoggedIn);
    } catch (e) {}

    if (userIsLoggedIn) {
      const currentAuthToken: CognitoUserSession = await Auth.currentSession();
      const famUser = parseToken(currentAuthToken);
      localStorage.setItem(FAM_LOGIN_USER, JSON.stringify(famUser));
      setUser(famUser);
      setProvider(famUser.provider);
      setToken(famUser.axiosRequestUser);

      // axios token
      axios.defaults.headers.common = {
        // Authorization: `Bearer ${token}`
        'Temporary-User-Identification': famUser.axiosRequestUser
      };
    }

    return userIsLoggedIn;
  };

  const signIn = (provider: LoginProviders): void => {
    const appEnv = env.VITE_ZONE ?? 'DEV';
  
    if (provider === LoginProviders.IDIR) {
      Auth.federatedSignIn({
        customProvider: `${(appEnv).toLocaleUpperCase()}-IDIR`
      });
    } else if (provider === LoginProviders.BCEID_BUSINESS) {
      Auth.federatedSignIn({
        customProvider: `${(appEnv).toLocaleUpperCase()}-BCEIDBUSINESS`
      });
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      localStorage.removeItem(FAM_LOGIN_USER);
      setSigned(false);
      setUser(null);
      setProvider('');
      setToken('');
      await Auth.signOut();
    } catch (e) {
      console.log(e);
    }
    return Promise.resolve();
  };

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
