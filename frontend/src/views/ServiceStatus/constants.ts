import { DependencyDefinition } from './definitions';
import { env } from '../../env';

const configuredUrl = (value: unknown) => (
  typeof value === 'string' && value.length > 0 ? value : null
);

const postgresServerUrl = configuredUrl(env.VITE_SERVER_URL);
const oracleServerUrl = configuredUrl(env.VITE_ORACLE_SERVER_URL);

const dependencyEnvironmentName = (url: string) => (
  url.includes('localhost') ? 'DEV' : (env.VITE_ZONE ?? 'DEV')
);

export const SPAR_DEPENDENCIES: DependencyDefinition[] = [
  ...(postgresServerUrl ? [{
    name: `SPAR Postgres Backend ${dependencyEnvironmentName(postgresServerUrl)}`,
    queryKey: 'postgres-backend-healthcheck',
    healthCheckUrl: `${postgresServerUrl}/health`,
    icon: 'DatabasePostgreSql'
  }] : []),
  ...(oracleServerUrl ? [{
    name: `SPAR Oracle Backend ${dependencyEnvironmentName(oracleServerUrl)}`,
    queryKey: 'oracle-backend-healthcheck',
    healthCheckUrl: `${oracleServerUrl}/actuator/health`,
    icon: 'IbmDb2'
  }] : []),
  {
    name: 'Forest Access Management API',
    queryKey: 'fam-healthcheck',
    healthCheckUrl: 'https://qdghpzq5dh.execute-api.ca-central-1.amazonaws.com/v1/smoke_test',
    icon: 'HardwareSecurityModule'
  },
  {
    name: 'Forest Client API',
    queryKey: 'fc-healthcheck',
    healthCheckUrl: 'https://nr-forest-client-api-prod.api.gov.bc.ca/health',
    icon: 'ShareKnowledge'
  }
];
