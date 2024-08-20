import { DependencyDefinition } from './definitions';
import { env } from '../../env';

export const SPAR_DEPENDENCIES: DependencyDefinition[] = [
  {
    name: `Postgres Backend${env.VITE_ZONE ? ` ${env.VITE_ZONE}` : ''}`,
    queryKey: 'postgres-backend-healthcheck',
    healthCheckUrl: `${env.VITE_SERVER_URL}/api/status`
  },
  {
    name: `Oracle Backend${env.VITE_ZONE ? ` ${env.VITE_ZONE}` : ''}`,
    queryKey: 'oracle-backend-healthcheck',
    healthCheckUrl: `${env.VITE_ORACLE_SERVER_URL}/actuator/health`
  },
  {
    name: 'Forest Access Management API',
    queryKey: 'fam-healthcheck',
    healthCheckUrl: 'https://6mud7781pe.execute-api.ca-central-1.amazonaws.com/v1/smoke_test'
  },
  {
    name: 'Forest Client API',
    queryKey: 'fc-healthcheck',
    healthCheckUrl: 'https://nr-forest-client-api-prod.api.gov.bc.ca/health'
  }
];
