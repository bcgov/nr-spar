/* eslint-disable no-undef */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Landing from '../../views/Landing';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';

describe('Landing component test', () => {
  const contextValue = {
    signed: true,
    user: null,
    isCurrentAuthUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    provider: 'idir',
    token: 'anything'
  };

  it('should have the correct title', () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={contextValue}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const content = {
      title: 'Welcome to SPAR',
      subtitle: 'Seed Planning and Registry Application',
      description: 'Register and store your seed and meet '
        + 'your annual reforestation needs using SPAR',
      idir_btn: 'Login with IDIR',
      bceid_btn: 'Login with Business BCeID'
    };

    expect(getByTestId('landing-title').textContent).toBe(content.title);
    expect(getByTestId('landing-subtitle').textContent).toBe(content.subtitle);
    expect(getByTestId('landing-desc').textContent).toBe(content.description);
    expect(getByTestId('landing-button__idir').textContent).toBe(content.idir_btn);
    expect(getByTestId('landing-button__bceid').textContent).toBe(content.bceid_btn);
  });

  it('should match the snapshot', () => {
    const landing = renderer
      .create(
        <AuthContext.Provider value={contextValue}>
          <BrowserRouter>
            <Landing />
          </BrowserRouter>
        </AuthContext.Provider>
      ).toJSON();

    expect(landing).toMatchSnapshot();
  });
});
