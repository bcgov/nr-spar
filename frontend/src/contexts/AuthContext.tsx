import { KeycloakLoginOptions } from 'keycloak-js';
import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react';
import KeycloakService from '../service/KeycloakService';
import KeycloakUser from '../types/KeycloakUser';

interface AuthContextData {
  signed: boolean;
  user: KeycloakUser | {};
  startKeycloak(): Promise<boolean>;
  login(options?: KeycloakLoginOptions): Promise<void>;
  logout(): Promise<void>;
  createLoginUrl(options?: KeycloakLoginOptions): string;
  provider: string;
  token: string | undefined,
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const REFRESH_TIMER = 2 * 60 * 1000;

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: Props) => {
  const [signed, setSigned] = useState<boolean>(false);
  const [user, setUser] = useState<KeycloakUser | {}>({});

  /**
   * Starts Keycloak instance.
   */
  async function startKeycloak() {
    try {
      const userIsLoggedIn = await KeycloakService.initKeycloak();
      setSigned(userIsLoggedIn);
      const kcUser = KeycloakService.getUser();
      setUser(kcUser);
      return userIsLoggedIn;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Keycloak init error:', e);
    }
    return false;
  }

  /**
   * Logout the user
   */
  async function logout() {
    try {
      localStorage.clear();
      await KeycloakService.logout();
      setUser({});
      setSigned(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Keycloak logout error:', e);
    }
  }

  /**
   * Refresh the token
   */
  setInterval(() => {
    KeycloakService.updateToken(30)
      .catch(async (err) => {
        // eslint-disable-next-line no-console
        console.error('Keycloack service update error: ', err);
        await logout();
      });
  }, REFRESH_TIMER);

  const { createLoginUrl, login } = KeycloakService;
  const provider = KeycloakService.authMethod();
  const token = KeycloakService.getToken();

  // memoize
  const contextValue = useMemo(() => ({
    signed,
    user,
    startKeycloak,
    login,
    logout,
    createLoginUrl,
    provider,
    token
  }), [signed, user, startKeycloak, login, logout, createLoginUrl, provider, token]);

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
