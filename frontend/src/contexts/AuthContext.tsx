import { createContext } from 'react';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';

interface AuthContextData {
  signed: boolean;
  user: FamUser | null;
  isCurrentAuthUser(pathname: string): void;
  signIn(provider: LoginProviders): void;
  signOut(): void;
  provider: string;
  token: string | undefined;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export default AuthContext;
