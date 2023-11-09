/* eslint-disable import/no-unresolved */
import {
  createServer
} from 'miragejs';

import mockServerConfig from './config';

import { endpoints, jestEndpoints } from './endpoints';
import fixtures from './fixtures';
import models from './models';
import { env } from '../env';

// eslint-disable-next-line
export default function makeServer(environment = 'development') {
  const mirageServer = createServer({
    models,
    fixtures,
    environment,
    seeds(server) {
      const dbData = localStorage.getItem('spar-mock-db');
      if (dbData) {
        server.db.loadData(JSON.parse(dbData));
      } else {
        server.loadFixtures();
      }
    },
    routes() {
      const NativeXMLHttpRequest = window.XMLHttpRequest;
      // @ts-ignore
      window.XMLHttpRequest = function XMLHttpRequest() {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        const request = new NativeXMLHttpRequest(arguments);
        // @ts-ignore
        delete request.onloadend;
        return request;
      };

      this.namespace = mockServerConfig.namespace;
      if (environment !== 'jest-test') {
        this.passthrough(`${env.VITE_SERVER_URL}/api/**`);
        this.passthrough(`${env.VITE_ORACLE_SERVER_URL}/api/**`);
      }
      this.passthrough('https://test.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token');
      this.passthrough('https://nr-spar-test-backend.apps.silver.devops.gov.bc.ca/**');
      this.passthrough('https://cognito-idp.ca-central-1.amazonaws.com/');
      this.pretender.handledRequest = (verb) => {
        if (verb.toLowerCase() !== 'get' && verb.toLowerCase() !== 'head') {
          localStorage.setItem('spar-mock-db', JSON.stringify(this.db.dump()));
        }
      };
    }
  });

  if (environment !== 'jest-test') {
    Object.keys(endpoints).forEach((endpoint) => {
      // @ts-ignore
      endpoints[endpoint](mirageServer);
    });
  } else {
    Object.keys(jestEndpoints).forEach((endpoint) => {
      // @ts-ignore
      jestEndpoints[endpoint](mirageServer);
    });
  }
}
