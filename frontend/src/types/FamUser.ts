import type { CognitoUserSession } from 'amazon-cognito-identity-js';

type FamUser = {
  displayName: string;
  email: string;
  lastName: string;
  firstName: string;
  idirUsername: string;
  name: string;
  roles: string[];
  authToken: CognitoUserSession;
}

export default FamUser;
