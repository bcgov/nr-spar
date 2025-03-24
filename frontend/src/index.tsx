import './init';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';

import App from './App';
import reportWebVitals from './reportWebVitals';
import AuthProvider from './contexts/AuthProvider';

import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StyleProvider hashPriority="high">
      <AuthProvider>
        <App />
      </AuthProvider>
    </StyleProvider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
