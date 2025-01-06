import React from 'react';
import { BrowserRouter } from 'react-router';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import BCHeader from '../../components/BCHeader';
import { ThemePreference } from '../../utils/ThemePreference';
import { describe, it, expect } from 'vitest';

describe('the Header component', () => {
  it('should have the correct title', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <ThemePreference>
          <BCHeader />
        </ThemePreference>
      </BrowserRouter>
    );

    expect(getByTestId('header-name').textContent).toBe('SPAR Seed Planning and Registry System');
  });

  it('should match the snapshot', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <BCHeader />
        </BrowserRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
