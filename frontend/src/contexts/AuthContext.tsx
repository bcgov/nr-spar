import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';
import FamUser from '../types/FamUser';
import { isLoggedIn, getUserFromStorage, refreshToken } from '../service/AuthService';

interface AuthContextData {
  signed: boolean;
  user: FamUser | undefined;
  startKeycloak(): boolean;
  provider: string;
  token: CognitoUserSession | undefined,
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const REFRESH_TIMER = 2 * 60 * 1000;

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<FamUser | undefined>(undefined);

  /**
   * Starts Keycloak instance.
   */
  function startKeycloak() {
    try {
      const userIsLoggedIn = isLoggedIn();
      setSigned(userIsLoggedIn);
      const kcUser = getUserFromStorage();
      setUser(kcUser);
      return userIsLoggedIn;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Keycloak init error:', e);
    }
    return false;
  }

  /**
   * Refresh the token
   */
  setInterval(() => {
    if (signed) {
      refreshToken();
      // No need to call logout here, since the refresh
      // will automatically call
    }
  }, REFRESH_TIMER);

  
  const provider = 'SOME';
  const token = getUserFromStorage()?.authToken;

  // memoize
  const contextValue = useMemo(() => ({
    signed,
    user,
    startKeycloak,
    provider,
    token
  }), [signed, user, startKeycloak, provider, token]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Create useAuth hook.
 *
 * @returns {AuthContext} context.
 */
function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
