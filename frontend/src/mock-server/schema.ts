/* eslint-disable import/no-unresolved */
import { Registry } from 'miragejs';
import Schema from 'miragejs/orm/schema';
import models from './models';

type AppRegistry = Registry<typeof models, {}>;
type AppSchema = Schema<AppRegistry>;

export default AppSchema;
