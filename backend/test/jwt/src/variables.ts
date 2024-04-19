export interface IEnvVars {
  clientId: string | undefined;
  region: string | undefined;
  userPoolId: string | undefined;
}

export function getEnvVars(): IEnvVars {
  const envVars: IEnvVars = {
    clientId: process.env.COGNITO_CLIENT_ID,
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
  };
  return envVars;
}
