import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClassPrefix } from '@carbon/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { ThemePreference } from './utils/ThemePreference';
import makeServer from './mock-server/server';

const appVersion: string = import.meta.env.VITE_NRSPARWEBAPP_VERSION;

const isDevEnv = appVersion === 'dev'
  || appVersion.startsWith('test')
  || appVersion.startsWith('PR-');

if (isDevEnv) {
  makeServer('development');
}

const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 3
      }
    }
  }
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <AuthProvider>
    <React.StrictMode>
      <ClassPrefix prefix="bx">
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
