import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getByText, render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import BCHeader from '../../components/BCHeader';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemePreference } from '../../utils/ThemePreference';
import { componentTexts } from '../../components/BCHeader/constants';

describe('the Header component', () => {
  it('should have the correct title, version and link', () => {
    const { getByTestId, getByText } = render(
      <BrowserRouter>
        <AuthProvider>
          <ThemePreference>
            <BCHeader />
          </ThemePreference>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(getByTestId('header-name').textContent).toBe('SPAR Seed Planning and Registry System');
    expect(getByTestId('header-name').href).toContain('/dashboard');
    expect(getByTestId('version-panel').textContent).toBe('Version: dev');
  });

  it('should match the snapshot', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <AuthProvider>
            <BCHeader />
          </AuthProvider>
        </BrowserRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
