/* eslint-disable no-undef */
import React from 'react';
import { render } from '@testing-library/react';
import { test } from 'vitest';
import App from '../App';

test('renders app', () => {
  render(
    <App />
  );
});
