import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  afterEach, beforeEach, describe, expect, it
} from 'vitest';

import SeedlotCards from '../../components/SeedlotCards';
import AuthContext, { AuthContextData } from '../../contexts/AuthContext';
import { env } from '../../env';

const renderCards = (isTscAdmin = false) => render(
  <BrowserRouter>
    <AuthContext.Provider value={{ isTscAdmin } as AuthContextData}>
      <SeedlotCards />
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Seedlot cards', () => {
  // Cleared before as well as after, so a developer's .env cannot switch the
  // flag on for the "disabled" case.
  beforeEach(() => {
    delete env.VITE_SEEDLOT_B_ENABLED;
  });

  afterEach(() => {
    delete env.VITE_SEEDLOT_B_ENABLED;
  });

  it('hides the B-class card unless the feature is enabled', () => {
    renderCards();
    expect(screen.queryByText('Register a B-class seedlot')).not.toBeInTheDocument();
    expect(screen.getByText('Register an A-class seedlot')).toBeInTheDocument();
    expect(screen.getByText('My seedlots')).toBeInTheDocument();
  });

  it('offers B-class registration when the feature is enabled', () => {
    env.VITE_SEEDLOT_B_ENABLED = 'true';
    renderCards();
    expect(screen.getByText('Register a B-class seedlot')).toBeInTheDocument();
  });
});
