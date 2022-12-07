/* eslint-disable no-undef */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import NewLanding from '../../views/NewLanding';
import { AuthProvider } from '../../contexts/AuthContext';

describe('NewLanding component test', () => {
  it('should have the correct title', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AuthProvider>
          <NewLanding />
        </AuthProvider>
      </BrowserRouter>
    );

    const content = {
      title: 'Welcome to SPAR',
      subtitle: 'Seed Planning and Registry Application',
      description: 'Register and storage your seed and meet '
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
    const newLanding = renderer
      .create(
        <BrowserRouter>
          <AuthProvider>
            <NewLanding />
          </AuthProvider>
        </BrowserRouter>
      ).toJSON();

    expect(newLanding).toMatchSnapshot();
  });
});
