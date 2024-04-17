import { createContext } from 'react';
import { UserRoleType } from '../types/UserRoleType';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';

export interface AuthContextData {
  signed: boolean;
  user: FamUser | null;
  selectedRole: UserRoleType | null;
  isCurrentAuthUser(pathname: string): void;
  signIn(provider: LoginProviders): void;
  signOut(): void;
  provider: string;
  setRole: (role: UserRoleType) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export default AuthContext;
