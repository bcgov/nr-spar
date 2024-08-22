import { DependencyDefinition } from './definitions';
import { env } from '../../env';

const POSTGRES_BACKEND_ENV = env.VITE_SERVER_URL.includes('localhost') ? 'DEV' : env.VITE_SERVER_URL;
const ORACLE_BACKEND_ENV = env.VITE_ORACLE_SERVER_URL.includes('localhost') ? 'DEV' : env.VITE_ORACLE_SERVER_URL;

export const SPAR_DEPENDENCIES: DependencyDefinition[] = [
  {
    name: `SPAR Postgres Backend ${POSTGRES_BACKEND_ENV === 'DEV' && env.VITE_SERVER_URL.includes('localhost')
      ? 'DEV' : env.VITE_ZONE}`,
    queryKey: 'postgres-backend-healthcheck',
    healthCheckUrl: `${env.VITE_SERVER_URL}/health`,
    icon: 'DatabasePostgreSql'
  },
  {
    name: `SPAR Oracle Backend ${ORACLE_BACKEND_ENV === 'DEV' && env.VITE_SERVER_URL.includes('localhost')
      ? 'DEV' : env.VITE_ZONE}`,
    queryKey: 'oracle-backend-healthcheck',
    healthCheckUrl: `${env.VITE_ORACLE_SERVER_URL}/actuator/health`,
    icon: 'IbmDb2'
  },
  {
    name: 'Forest Access Management API',
    queryKey: 'fam-healthcheck',
    healthCheckUrl: 'https://6mud7781pe.execute-api.ca-central-1.amazonaws.com/v1/smoke_test',
    icon: 'HardwareSecurityModule'
  },
  {
    name: 'Forest Client API',
    queryKey: 'fc-healthcheck',
    healthCheckUrl: 'https://nr-forest-client-api-prod.api.gov.bc.ca/health',
    icon: 'ShareKnowledge'
  }
];
