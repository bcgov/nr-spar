import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import BCHeader from '../../components/BCHeader';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemePreference } from '../../utils/ThemePreference';

describe('the Header component', () => {
  it('should have the correct title', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AuthProvider>
          <ThemePreference>
            <BCHeader />
          </ThemePreference>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(getByTestId('header-name').textContent).toBe('SPAR Seed Planning and Registry System');
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
