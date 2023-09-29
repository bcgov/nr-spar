import React, { createContext } from 'react';
import FamUser from "../types/FamUser";
import LoginProviders from "../types/LoginProviders";

interface AuthContextData {
  signed: boolean;
  user: FamUser | null;
  isCurrentAuthUser(): Promise<boolean>;
  signIn(provider: LoginProviders): void;
  signOut(): Promise<void>;
  provider: string;
  token: string | undefined;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
