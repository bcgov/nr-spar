import './init';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import App from './App';
import reportWebVitals from './reportWebVitals';
import AuthProvider from './contexts/AuthProvider';

import 'antd/dist/reset.css';

const cache = createCache({ key: 'css', prepend: true });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <CacheProvider value={cache}>
      <StyleProvider hashPriority="high">
        <AuthProvider>
          <App />
        </AuthProvider>
      </StyleProvider>
    </CacheProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
