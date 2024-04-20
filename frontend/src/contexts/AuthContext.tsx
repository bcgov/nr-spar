import { createContext } from 'react';
import { UserClientRolesType } from '../types/UserRoleType';
import FamUser from '../types/FamUser';
import LoginProviders from '../types/LoginProviders';

export interface AuthContextData {
  signed: boolean;
  user: FamUser | null;
  selectedClientRoles: UserClientRolesType | null;
  isCurrentAuthUser(pathname: string): void;
  signIn(provider: LoginProviders): void;
  signOut(): void;
  provider: string;
  setClientRoles: (clientRoles: UserClientRolesType, reload?: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export default AuthContext;
