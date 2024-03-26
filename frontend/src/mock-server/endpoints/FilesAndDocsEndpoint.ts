import { Server } from 'miragejs';
import ApiConfig from '../../api-service/ApiConfig';
import mockServerConfig from '../config';

const FilesAndDocsEndpoint = (server: Server) => {
  const url = ApiConfig.filesAndDocs.replace(mockServerConfig.namespace, '');
  server.get(url, ({ db }) => db.filesAndDocs);
};

export default FilesAndDocsEndpoint;
