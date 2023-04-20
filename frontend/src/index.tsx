import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClassPrefix } from '@carbon/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { ThemePreference } from './utils/ThemePreference';
import { env } from './env';
import makeServer from './mock-server/server';

const isDevEnv = env.REACT_APP_NRSPARWEBAPP_VERSION === 'dev' || env.REACT_APP_NRSPARWEBAPP_VERSION === 'test';

if (isDevEnv) {
  makeServer('development');
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <AuthProvider>
    <React.StrictMode>
      <ClassPrefix prefix="bcgov">
        <ThemePreference>
          <QueryClientProvider client={queryClient}>
            <App />
            {
              isDevEnv && <ReactQueryDevtools initialIsOpen={false} />
            }
          </QueryClientProvider>
        </ThemePreference>
      </ClassPrefix>
    </React.StrictMode>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
