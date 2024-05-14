import { UserClientRolesType } from './UserRoleType';

type FamUser = {
  displayName: string;
  email: string;
  lastName: string;
  firstName: string;
  providerUsername: string;
  name: string;
  clientRoles: UserClientRolesType[];
  provider: string;
  jwtToken: string;
  refreshToken: string;
  userId: string;
  tokenExpiration: number;
}

export default FamUser;
