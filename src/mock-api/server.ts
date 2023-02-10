/* eslint-disable import/no-unresolved */
import {
  createServer
} from 'miragejs';

import endpoints from './endpoints';
import fixtures from './fixtures';
import models from './models';

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
      this.namespace = 'mock-api';
      this.passthrough('https://test.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token');
    }
  });

  Object.keys(endpoints).forEach((namespace) => {
    // @ts-ignore
    endpoints[namespace](mirageServer);
  });

  mirageServer.pretender.handledRequest = (verb) => {
    if (verb.toLowerCase() !== 'get' && verb.toLowerCase() !== 'head') {
      localStorage.setItem('spar-mock-db', JSON.stringify(mirageServer.db.dump()));
    }
  };
}
