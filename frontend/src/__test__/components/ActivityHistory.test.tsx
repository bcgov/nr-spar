import React from 'react';
import { render, screen } from '@testing-library/react';
import ActivityHistory from '../../components/ActivityHistory';
import ActivityHistoryItems from '../../mock-server/fixtures/ActivityHistoryItems';
import '@testing-library/jest-dom';

describe('Activity History component', () => {
  it('should render seedlot number and steps correctly', () => {
    render(
      <ActivityHistory
        history={ActivityHistoryItems}
      />
    );

    expect(screen.getByText('Seedlot 12345')).toBeInTheDocument();
    expect(screen.getByText('Complete the step 4')).toBeInTheDocument();
    expect(screen.getByText('Complete the step 3')).toBeInTheDocument();
    expect(screen.getByText('Complete the step 2')).toBeInTheDocument();
    expect(screen.getByText('Start the registration progress')).toBeInTheDocument();
  });
});
