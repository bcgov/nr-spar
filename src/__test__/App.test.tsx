/* eslint-disable no-undef */
import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';

test('renders app', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});
