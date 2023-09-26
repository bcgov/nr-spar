import { Auth } from 'aws-amplify';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';
import { env } from '../env';
import LoginProviders from '../types/LoginProviders';
import FamUser from '../types/FamUser';

const FAM_LOGIN_USER = 'famLoginUser';

export const signIn = async (provider: LoginProviders): Promise<any> => {
  const appEnv = env.VITE_ZONE ?? 'DEV';

  if (provider === LoginProviders.IDIR) {
    await Auth.federatedSignIn({
      customProvider: `${(appEnv).toLocaleUpperCase()}-IDIR`
    });
  } else if (provider === LoginProviders.BCEID_BUSINESS) {
    await Auth.federatedSignIn({
      customProvider: `${(appEnv).toLocaleUpperCase()}-BCEIDBUSINESS`
    });
  }
  // else if invalid option passed logout the user
  else {
    await logout();
  }
};

export const isLoggedIn = () => {
  // this will convert the locally stored string to FamLoginUser interface type
  // TODO add this to state once redux store is configured
  const stateInfo = getUserFromStorage();
  // console.log(`AuthService - isLoggedIn: stateInfo=${JSON.stringify(stateInfo)}`);
  // check if the user is logged in
  const loggedIn = !!stateInfo?.authToken; // TODO check if token expired later?
  console.log(`AuthService - isLoggedIn: loggedIn=${loggedIn}`);
  // here.. check
  if (loggedIn) {
    console.log(`Checking if token got expired...`);
    // if (Date.now() >= stateInfo.exp * 1000)
  }
  return loggedIn;
}

export const getUserFromStorage = () => {
  return (JSON.parse(localStorage.getItem(FAM_LOGIN_USER) as string) as
            | FamUser
            | undefined);
};

export const handlePostLogin = async () => {
  try {
    console.log('handlePostLogin');
    await refreshToken();
  } catch (error) {
    console.log('Authentication Error:', error);
  }
}

/**
 * Amplify method currentSession() will automatically refresh the accessToken and idToken
 * if tokens are "expired" and a valid refreshToken presented.
 *   // console.log("currentAuthToken: ", currentAuthToken)
 *   // console.log("ID Token: ", currentAuthToken.getIdToken().getJwtToken())
 *   // console.log("Access Token: ", currentAuthToken.getAccessToken().getJwtToken())
 *
 * Automatically logout if unable to get currentSession().
 */
export const refreshToken = async (): Promise<FamUser | undefined> => {
  try {
    console.log('Refreshing Token...');
    const currentAuthToken: CognitoUserSession = await Auth.currentSession();
    const famLoginUser = parseToken(currentAuthToken);
    await storeFamUser(famLoginUser);
    return famLoginUser;
  } catch (error) {
    console.error('Problem refreshing token or token is invalidated:', error);
    // logout and redirect to login.
    logout();
  }
}

/**
* See OIDC Attribute Mapping mapping reference:
*      https://github.com/bcgov/nr-forests-access-management/wiki/OIDC-Attribute-Mapping
* Note, current user data return for 'userData.username' is matched to "cognito:username" on Cognito.
* Which isn't what we really want to display. The display username is "custom:idp_username" from token.
*/

function parseToken(authToken: CognitoUserSession): FamUser {
  const decodedIdToken = authToken.getIdToken().decodePayload();
  const decodedAccessToken = authToken.getAccessToken().decodePayload();
  
  // Extract the first name and last name from the displayName and remove unwanted part
  const displayName = decodedIdToken['custom:idp_display_name'];
  const [lastName, firstName] = displayName.split(', ');
  const sanitizedFirstName = firstName.split(' ')[0].trim(); // Remove unwanted part
  const famUser: FamUser = {
    displayName: decodedIdToken['custom:idp_username'],
    email: decodedIdToken['email'],
    lastName,
    firstName: sanitizedFirstName,
    idirUsername: '',
    name: decodedIdToken['custom:idp_display_name'],
    roles: decodedAccessToken['cognito:groups'],
    // idpProvider: decodedIdToken['identities']['providerName'],
    authToken,
  };

  return famUser;
}

function removeFamUser() {
  storeFamUser(null);
}

function storeFamUser(famLoginUser: FamUser | null | undefined) {
  console.log('Storing the FAM user in locaStorage')
  if (famLoginUser) {
    localStorage.setItem(FAM_LOGIN_USER, JSON.stringify(famLoginUser))
  } else {
    localStorage.removeItem(FAM_LOGIN_USER)
  }
}

export const isCurrentAuthUser = async () => {
  try {
    // checks if the user is authenticated
    await Auth.currentAuthenticatedUser();
    // refreshes the token and stores it locally
    await refreshToken();
    return true;
  } catch (error) {
    return false;
  }
}

export const logout = async () => {
  await Auth.signOut();
  removeFamUser();
  console.log('User logged out.');
}
