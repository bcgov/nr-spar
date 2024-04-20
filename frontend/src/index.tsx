import './init';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { env } from './env';
import makeServer from './mock-server/server';
import AuthProvider from './contexts/AuthProvider';

const appVersion: string = env.VITE_NRSPARWEBAPP_VERSION || 'dev';

const isDevEnv = appVersion === 'dev'
  || appVersion.startsWith('test')
  || appVersion.startsWith('PR-');

if (isDevEnv) {
  makeServer('development');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
