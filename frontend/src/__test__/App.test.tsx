/* eslint-disable no-undef */
import React from 'react';
import { render } from '@testing-library/react';
import { test } from 'vitest';
import App from '../App';
import AuthContext from '../contexts/AuthContext';
import authContextMock from '../__test__/__mocks__/authContextMock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

test('renders app', () => {
  const qc = new QueryClient();

  render(
    <AuthContext.Provider value={authContextMock}>
      <QueryClientProvider client={qc}>
        <App />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
});
