import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SeedlotActivities from '../../components/SeedlotActivities';

describe('Seedlot Activities component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <SeedlotActivities />
      </BrowserRouter>
    );
  });

  it('should render correctly', () => {
    expect(screen.getByText('Register an A class seedlot')).toBeInTheDocument();
    expect(screen.getByText('Register a B class seedlot')).toBeInTheDocument();
    expect(screen.getByText('My seedlots')).toBeInTheDocument();
    expect(screen.getByText('Activity history')).toBeInTheDocument();
  });
});
